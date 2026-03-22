-- TripNow 数据库 Schema 设计
-- PostgreSQL 14+
-- 创建时间: 2026-03-22

-- ============================================
-- 1. 数据库初始化
-- ============================================

-- 创建数据库（如需要）
-- CREATE DATABASE tripnow WITH ENCODING = 'UTF8';

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建更新时间自动触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 2. 用户表 (users)
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 基本信息
    phone VARCHAR(20) UNIQUE,                    -- 手机号（中国大陆）
    email VARCHAR(255) UNIQUE,                   -- 邮箱
    password_hash VARCHAR(255),                  -- 密码哈希（bcrypt）
    
    -- 用户资料
    nickname VARCHAR(50) NOT NULL,               -- 昵称
    avatar_url TEXT,                             -- 头像 URL
    real_name VARCHAR(50),                       -- 真实姓名
    
    -- 微信登录信息
    wechat_openid VARCHAR(100) UNIQUE,           -- 微信 OpenID
    wechat_unionid VARCHAR(100),                 -- 微信 UnionID
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_wechat ON users(wechat_openid) WHERE wechat_openid IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);

-- 用户表更新时间触发器
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS '用户表 - 存储注册用户的基本信息';
COMMENT ON COLUMN users.status IS '用户状态: active-正常, inactive-未激活, banned-已封禁';

-- ============================================
-- 3. 账本表 (ledgers)
-- ============================================

CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 账本信息
    name VARCHAR(100) NOT NULL,                  -- 账本名称
    description TEXT,                            -- 账本描述
    cover_image_url TEXT,                        -- 封面图片
    
    -- 货币设置
    currency_code VARCHAR(3) DEFAULT 'CNY' NOT NULL,  -- 货币代码 (ISO 4217)
    currency_symbol VARCHAR(10) DEFAULT '¥',     -- 货币符号
    
    -- 旅行信息
    location VARCHAR(200),                       -- 旅行地点
    start_date DATE,                             -- 开始日期
    end_date DATE,                               -- 结束日期
    
    -- 预算设置
    budget DECIMAL(15, 2),                       -- 预算金额
    
    -- 所有者
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- 皮肤主题
    theme VARCHAR(50) DEFAULT 'default',         -- 主题皮肤
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 账本表索引
CREATE INDEX idx_ledgers_owner ON ledgers(owner_id);
CREATE INDEX idx_ledgers_status ON ledgers(status);
CREATE INDEX idx_ledgers_owner_status ON ledgers(owner_id, status);

-- 账本表更新时间触发器
CREATE TRIGGER trigger_ledgers_updated_at
    BEFORE UPDATE ON ledgers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ledgers IS '账本表 - 存储旅行账本的基本信息';
COMMENT ON COLUMN ledgers.status IS '账本状态: active-进行中, archived-已归档, deleted-已删除';
COMMENT ON COLUMN ledgers.theme IS '账本主题皮肤: default, ocean, mountain, city, etc.';

-- ============================================
-- 4. 成员表 (members)
-- ============================================

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联信息
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- 注册用户（可为空，影子成员）
    
    -- 成员信息
    name VARCHAR(50) NOT NULL,                   -- 成员名称（账本内）
    avatar_url TEXT,                             -- 头像 URL
    
    -- 成员类型
    type VARCHAR(20) DEFAULT 'regular' CHECK (type IN ('regular', 'shadow', 'owner')),
    
    -- 角色权限
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    
    -- 影子成员状态
    shadow_status VARCHAR(20) DEFAULT 'unclaimed' CHECK (shadow_status IN ('unclaimed', 'pending', 'claimed')),
    
    -- 邀请信息
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- 加入时间
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 唯一约束：一个账本内成员名称唯一
    UNIQUE(ledger_id, name)
);

-- 成员表索引
CREATE INDEX idx_members_ledger ON members(ledger_id);
CREATE INDEX idx_members_user ON members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_members_ledger_type ON members(ledger_id, type);
CREATE INDEX idx_members_shadow ON members(shadow_status) WHERE type = 'shadow';

-- 成员表更新时间触发器
CREATE TRIGGER trigger_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE members IS '成员表 - 账本成员，支持影子成员（未注册用户）';
COMMENT ON COLUMN members.type IS '成员类型: regular-注册用户, shadow-影子成员, owner-账本创建者';
COMMENT ON COLUMN members.role IS '角色权限: owner-所有者, admin-管理员, member-普通成员, viewer-仅查看';
COMMENT ON COLUMN members.shadow_status IS '影子成员状态: unclaimed-未认领, pending-待确认, claimed-已认领';

-- ============================================
-- 5. 账单表 (expenses)
-- ============================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联账本
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
    
    -- 账单基本信息
    title VARCHAR(200) NOT NULL,                 -- 账单标题
    amount DECIMAL(15, 2) NOT NULL,              -- 总金额
    
    -- 支付信息
    payer_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    
    -- 分类信息
    category VARCHAR(50) NOT NULL,               -- 分类: food, transport, accommodation, etc.
    sub_category VARCHAR(50),                    -- 子分类
    
    -- 时间和地点
    expense_date DATE NOT NULL,                  -- 消费日期
    expense_time TIME,                           -- 消费时间
    location VARCHAR(200),                       -- 消费地点
    location_lat DECIMAL(10, 8),                 -- 纬度
    location_lng DECIMAL(11, 8),                 -- 经度
    
    -- 分摊类型
    split_type VARCHAR(20) DEFAULT 'equal' CHECK (split_type IN ('equal', 'percentage', 'fixed', 'shares')),
    
    -- 备注和图片
    note TEXT,                                   -- 备注
    image_urls TEXT[],                           -- 图片 URL 数组
    
    -- 语音备注
    voice_note_url TEXT,                         -- 语音备注 URL
    voice_duration INTEGER,                      -- 语音时长（秒）
    
    -- AI 识别信息
    ai_confidence DECIMAL(3, 2),                 -- AI 识别置信度 0.00-1.00
    ai_raw_data JSONB,                           -- AI 原始识别数据
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'deleted')),
    
    -- 创建者
    created_by UUID NOT NULL REFERENCES members(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 账单表索引
CREATE INDEX idx_expenses_ledger ON expenses(ledger_id);
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_ledger_date ON expenses(ledger_id, expense_date DESC);
CREATE INDEX idx_expenses_status ON expenses(status);

-- 账单表更新时间触发器
CREATE TRIGGER trigger_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE expenses IS '账单表 - 存储每笔支出记录';
COMMENT ON COLUMN expenses.split_type IS '分摊类型: equal-均分, percentage-按比例, fixed-固定金额, shares-按份数';
COMMENT ON COLUMN expenses.status IS '账单状态: pending-待确认, confirmed-已确认, deleted-已删除';

-- ============================================
-- 6. 账单分摊明细表 (expense_splits)
-- ============================================

CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联账单
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    
    -- 分摊成员
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- 分摊金额
    amount DECIMAL(15, 2) NOT NULL,              -- 该成员应分摊金额
    
    -- 分摊比例（用于 percentage 类型）
    percentage DECIMAL(5, 2),                    -- 百分比 0.00-100.00
    
    -- 份数（用于 shares 类型）
    shares INTEGER DEFAULT 1,                    -- 份数
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 唯一约束：一个账单中每个成员只能有一条记录
    UNIQUE(expense_id, member_id)
);

-- 分摊明细表索引
CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_member ON expense_splits(member_id);

COMMENT ON TABLE expense_splits IS '账单分摊明细表 - 存储每笔账单的分摊详情';

-- ============================================
-- 7. 结算表 (settlements)
-- ============================================

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联账本
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
    
    -- 结算双方
    from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,  -- 付款方
    to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,    -- 收款方
    
    -- 结算金额
    amount DECIMAL(15, 2) NOT NULL,              -- 结算金额
    
    -- 结算状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- 支付方式
    payment_method VARCHAR(50),                  -- 支付方式: wechat, alipay, cash, etc.
    payment_proof_url TEXT,                      -- 支付凭证图片
    
    -- 结算时间
    settled_at TIMESTAMP WITH TIME ZONE,         -- 实际结算时间
    
    -- 备注
    note TEXT,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 结算表索引
CREATE INDEX idx_settlements_ledger ON settlements(ledger_id);
CREATE INDEX idx_settlements_from ON settlements(from_member_id);
CREATE INDEX idx_settlements_to ON settlements(to_member_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_ledger_status ON settlements(ledger_id, status);

-- 结算表更新时间触发器
CREATE TRIGGER trigger_settlements_updated_at
    BEFORE UPDATE ON settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE settlements IS '结算表 - 存储成员间的结算记录';
COMMENT ON COLUMN settlements.status IS '结算状态: pending-待结算, completed-已完成, cancelled-已取消';

-- ============================================
-- 8. 公账/钱包表 (wallets)
-- ============================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联账本
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
    
    -- 钱包信息
    name VARCHAR(100) DEFAULT '公共钱包',         -- 钱包名称
    balance DECIMAL(15, 2) DEFAULT 0,            -- 当前余额
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 钱包表索引
CREATE INDEX idx_wallets_ledger ON wallets(ledger_id);

-- 钱包表更新时间触发器
CREATE TRIGGER trigger_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE wallets IS '公账/钱包表 - 每个账本有一个公共钱包用于集体资金管理';

-- ============================================
-- 9. 钱包交易记录表 (wallet_transactions)
-- ============================================

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联钱包
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    
    -- 交易信息
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'expense')),
    amount DECIMAL(15, 2) NOT NULL,              -- 交易金额
    
    -- 关联成员（充值时记录谁充的）
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    
    -- 关联账单（支出时记录）
    expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    
    -- 交易描述
    title VARCHAR(200),                          -- 交易标题
    note TEXT,                                   -- 备注
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 钱包交易记录表索引
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_member ON wallet_transactions(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX idx_wallet_transactions_expense ON wallet_transactions(expense_id) WHERE expense_id IS NOT NULL;
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

COMMENT ON TABLE wallet_transactions IS '钱包交易记录表 - 记录公账的所有资金流动';
COMMENT ON COLUMN wallet_transactions.type IS '交易类型: deposit-充值, withdrawal-提现, expense-支出';

-- ============================================
-- 10. 账本邀请表 (ledger_invitations)
-- ============================================

CREATE TABLE ledger_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联账本
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
    
    -- 邀请信息
    invite_code VARCHAR(20) UNIQUE NOT NULL,     -- 邀请码
    invited_by UUID NOT NULL REFERENCES users(id),
    
    -- 被邀请人（可选，预指定手机号或邮箱）
    target_phone VARCHAR(20),
    target_email VARCHAR(255),
    
    -- 邀请状态
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    
    -- 过期时间
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 使用时间
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES users(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 邀请表索引
CREATE INDEX idx_ledger_invitations_code ON ledger_invitations(invite_code);
CREATE INDEX idx_ledger_invitations_ledger ON ledger_invitations(ledger_id);
CREATE INDEX idx_ledger_invitations_status ON ledger_invitations(status);

COMMENT ON TABLE ledger_invitations IS '账本邀请表 - 存储账本邀请码信息';

-- ============================================
-- 11. 汇率缓存表 (exchange_rates)
-- ============================================

CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 货币对
    from_currency VARCHAR(3) NOT NULL,           -- 源货币
    to_currency VARCHAR(3) NOT NULL,             -- 目标货币
    
    -- 汇率
    rate DECIMAL(20, 10) NOT NULL,               -- 汇率
    
    -- 数据来源
    source VARCHAR(50) DEFAULT 'api',            -- 数据来源
    
    -- 时间戳
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 唯一约束
    UNIQUE(from_currency, to_currency, fetched_at)
);

-- 汇率表索引
CREATE INDEX idx_exchange_rates_from_to ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_fetched ON exchange_rates(fetched_at DESC);

COMMENT ON TABLE exchange_rates IS '汇率缓存表 - 缓存汇率数据减少 API 调用';

-- ============================================
-- 12. 视图：账本统计
-- ============================================

CREATE VIEW ledger_stats AS
SELECT 
    l.id AS ledger_id,
    l.name AS ledger_name,
    COUNT(DISTINCT m.id) AS member_count,
    COUNT(DISTINCT e.id) AS expense_count,
    COALESCE(SUM(e.amount), 0) AS total_expenses,
    l.budget,
    l.budget - COALESCE(SUM(e.amount), 0) AS remaining_budget
FROM ledgers l
LEFT JOIN members m ON l.id = m.ledger_id AND m.type != 'shadow'
LEFT JOIN expenses e ON l.id = e.ledger_id AND e.status = 'confirmed'
WHERE l.status = 'active'
GROUP BY l.id, l.name, l.budget;

COMMENT ON VIEW ledger_stats IS '账本统计视图 - 快速获取账本的基本统计数据';

-- ============================================
-- 13. 视图：成员余额
-- ============================================

CREATE VIEW member_balances AS
SELECT 
    m.id AS member_id,
    m.ledger_id,
    m.name AS member_name,
    
    -- 支付金额（我付的钱）
    COALESCE(SUM(DISTINCT e.amount), 0) AS paid_amount,
    
    -- 应付金额（我应该分摊的钱）
    COALESCE(SUM(es.amount), 0) AS owed_amount,
    
    -- 余额（正数表示别人欠我，负数表示我欠别人）
    COALESCE(SUM(DISTINCT e.amount), 0) - COALESCE(SUM(es.amount), 0) AS balance
    
FROM members m
LEFT JOIN expenses e ON m.id = e.payer_id AND e.status = 'confirmed'
LEFT JOIN expense_splits es ON m.id = es.member_id
WHERE m.type != 'shadow' OR m.shadow_status = 'claimed'
GROUP BY m.id, m.ledger_id, m.name;

COMMENT ON VIEW member_balances IS '成员余额视图 - 计算每个成员在账本中的收支平衡';

-- ============================================
-- 数据完整性约束
-- ============================================

-- 确保账本结束日期不早于开始日期
ALTER TABLE ledgers ADD CONSTRAINT chk_ledgers_dates 
    CHECK (end_date IS NULL OR end_date >= start_date);

-- 确保账单日期在账本有效期内
-- 注：此约束需要在应用层实现，因为涉及跨表检查

-- 确保结算金额为正数
ALTER TABLE settlements ADD CONSTRAINT chk_settlements_amount 
    CHECK (amount > 0);

-- 确保结算双方不同
ALTER TABLE settlements ADD CONSTRAINT chk_settlements_different_members 
    CHECK (from_member_id != to_member_id);

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认分类（可选，用于前端下拉选择）
-- 实际分类在应用层枚举定义，此处仅作参考

-- ============================================
-- 权限设置（生产环境使用）
-- ============================================

-- 创建应用数据库用户（示例）
-- CREATE USER tripnow_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE tripnow TO tripnow_app;
-- GRANT USAGE ON SCHEMA public TO tripnow_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tripnow_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tripnow_app;
