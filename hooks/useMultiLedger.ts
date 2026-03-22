import { useState, useCallback, useEffect } from 'react';
import { Trip, Member } from '../types';
import { MOCK_TRIPS, MOCK_MEMBERS } from '../data/mockData';

// 生成唯一ID
const generateId = () => `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 默认账本图片
const DEFAULT_TRIP_IMAGES = [
  'https://picsum.photos/seed/trip1/800/400',
  'https://picsum.photos/seed/trip2/800/400',
  'https://picsum.photos/seed/trip3/800/400',
  'https://picsum.photos/seed/trip4/800/400',
  'https://picsum.photos/seed/trip5/800/400',
];

// 从 LocalStorage 加载数据
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 保存到 LocalStorage
const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

interface UseMultiLedgerReturn {
  trips: Trip[];
  currentTripId: string;
  setCurrentTripId: (id: string) => void;
  addTrip: (tripData: Omit<Trip, 'id' | 'status'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  archiveTrip: (id: string) => void;
  unarchiveTrip: (id: string) => void;
  addMemberToTrip: (tripId: string, member: Member) => void;
  removeMemberFromTrip: (tripId: string, memberId: string) => void;
}

export const useMultiLedger = (): UseMultiLedgerReturn => {
  // 从 LocalStorage 加载账本列表
  const [trips, setTrips] = useState<Trip[]>(() => 
    loadFromStorage('ts_trips', MOCK_TRIPS)
  );
  
  // 当前选中的账本ID
  const [currentTripId, setCurrentTripId] = useState<string>(() => 
    loadFromStorage('ts_currentTripId', MOCK_TRIPS[0]?.id || '')
  );

  // 保存到 LocalStorage
  useEffect(() => {
    saveToStorage('ts_trips', trips);
  }, [trips]);

  useEffect(() => {
    saveToStorage('ts_currentTripId', currentTripId);
  }, [currentTripId]);

  // 添加新账本
  const addTrip = useCallback((tripData: Omit<Trip, 'id' | 'status'>): Trip => {
    const newTrip: Trip = {
      ...tripData,
      id: generateId(),
      status: 'ongoing',
      members: tripData.members?.length ? tripData.members : [MOCK_MEMBERS[0]], // 默认添加当前用户
      image: tripData.image || DEFAULT_TRIP_IMAGES[Math.floor(Math.random() * DEFAULT_TRIP_IMAGES.length)],
    };
    
    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  }, []);

  // 更新账本
  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, ...updates } : trip
    ));
  }, []);

  // 删除账本
  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
    // 如果删除的是当前账本，切换到第一个可用账本
    if (currentTripId === id) {
      const remaining = trips.filter(t => t.id !== id);
      setCurrentTripId(remaining[0]?.id || '');
    }
  }, [currentTripId, trips]);

  // 归档账本
  const archiveTrip = useCallback((id: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, status: 'archived' as const } : trip
    ));
  }, []);

  // 恢复账本
  const unarchiveTrip = useCallback((id: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, status: 'ongoing' as const } : trip
    ));
  }, []);

  // 添加成员到账本
  const addMemberToTrip = useCallback((tripId: string, member: Member) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, members: [...trip.members, member] }
        : trip
    ));
  }, []);

  // 从账本移除成员
  const removeMemberFromTrip = useCallback((tripId: string, memberId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, members: trip.members.filter(m => m.id !== memberId) }
        : trip
    ));
  }, []);

  return {
    trips,
    currentTripId,
    setCurrentTripId,
    addTrip,
    updateTrip,
    deleteTrip,
    archiveTrip,
    unarchiveTrip,
    addMemberToTrip,
    removeMemberFromTrip,
  };
};