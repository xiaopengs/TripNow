const path = require('path');
const Ci = require('miniprogram-ci');
const program = require('commander');

const appid = process.env.MINIPROGRAM_APPID;
const privateKeyPath = process.env.MINIPROGRAM_PRIVATE_KEY_PATH;

if (!appid || !privateKeyPath) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   MINIPROGRAM_APPID 或 MINIPROGRAM_PRIVATE_KEY_PATH');
  console.error('');
  console.error('请设置环境变量后重试:');
  console.error('  Windows: set MINIPROGRAM_APPID=wx... && set MINIPROGRAM_PRIVATE_KEY_PATH=./private.key && npm run upload');
  console.error('  macOS/Linux: export MINIPROGRAM_APPID=wx... && export MINIPROGRAM_PRIVATE_KEY_PATH=./private.key && npm run upload');
  process.exit(1);
}

program
  .option('-t, --type <type>', '发布类型: preview | upload', 'preview')
  .option('-v, --version <version>', '版本号', process.env.GITHUB_REF_NAME || '1.0.0')
  .option('-d, --desc <desc>', '版本描述', process.env.GITHUB_SHA ? `GitHub Action: ${process.env.GITHUB_SHA.slice(0, 7)}` : '手动上传')
  .parse(process.argv);

const options = program.opts();

async function upload() {
  console.log('🚀 开始上传小程序...');
  console.log(`   AppID: ${appid}`);
  console.log(`   类型: ${options.type}`);
  console.log(`   版本: ${options.version}`);
  console.log('');

  const project = new Ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../dist'),
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  const uploadOptions = {
    project,
    version: options.version,
    desc: options.desc,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      minifyWXSS: true,
      minifyWXML: true,
      codeProtect: false,
      autoPrefixWXSS: true,
    },
    onProgressUpdate: (progress) => {
      if (progress.message) {
        console.log(`   ${progress.message}`);
      }
    },
  };

  try {
    if (options.type === 'preview') {
      console.log('📱 生成预览...');
      const previewResult = await Ci.preview(uploadOptions);
      console.log('');
      console.log('✅ 预览成功!');
      console.log(`   预览二维码路径: ${previewResult.qrcodeFilePath}`);
      if (previewResult.qrcodeContent) {
        console.log(`   二维码内容: ${previewResult.qrcodeContent}`);
      }
    } else {
      console.log('📤 上传代码...');
      const uploadResult = await Ci.upload(uploadOptions);
      console.log('');
      console.log('✅ 上传成功!');
      console.log(`   版本: ${uploadResult.version}`);
      console.log(`   描述: ${uploadResult.desc}`);
      console.log('');
      console.log('💡 请登录微信公众平台发布体验版或提交审核');
    }
  } catch (error) {
    console.error('');
    console.error('❌ 上传失败:', error.message);
    if (error.code) {
      console.error(`   错误码: ${error.code}`);
    }
    process.exit(1);
  }
}

upload();
