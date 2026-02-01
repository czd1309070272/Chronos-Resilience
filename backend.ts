
import { UserSettings, Milestone, LogEntry, UserAnalytics, CoreAttributes, FutureLetter, UserProfile, DailyTask, DailyTaskHistory } from './types';
import { INITIAL_SETTINGS, MOCK_MILESTONES, MOCK_LOGS } from './constants';
// import { GoogleGenAI } from "@google/genai";

/**
 * 吐司通知類型定義
 */
export type ToastType = 'info' | 'success' | 'warning';

/**
 * 通知歷史記錄條目接口
 */
export interface NotificationHistoryEntry {
  id: string;
  message: string;
  type: ToastType;
  timestamp: string; // ISO 格式時間戳
}

/**
 * BackendService - 星航號核心服務類
 * 負責處理所有的數據持久化、屬性矩陣計算、文件存儲以及與 Gemini AI 的通訊。
 */
class BackendService {
  private baseUrl = '/api';
  private notifyCallback: ((msg: string, type: ToastType) => void) | null = null;
  
  // IndexedDB 配置：用於存儲語音信號等大型二進位文件
  private dbName = 'ChronosStorage';
  private dbVersion = 1;
  private storeName = 'files';

  // 核心屬性常量
  private readonly ATTR_KEY = 'chronos_core_attributes_v3'; // 存儲鍵名
  private readonly LAST_SYNC_KEY = 'chronos_last_attr_sync'; // 末次同步時間
  private readonly ENTROPY_RATE = 0.002; // 屬性每小時自然衰減率 (模擬時間的侵蝕)

  constructor() {
    this.initDB();
  }

  /**
   * 初始化 IndexedDB
   * 為語音日誌和頭像等二進位數據建立本地存儲空間。
   */
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 設置全局通知回調
   * 用於將後端產生的信號推送到 UI 層的 Toast 組件。
   */
  setNotifyCallback(callback: (msg: string, type: ToastType) => void) {
    this.notifyCallback = callback;
  }

  /**
   * 發送系統通知
   * 觸發 Toast 並將記錄存入通訊存檔區。
   */
  notify(msg: string, type: ToastType = 'info') {
    this.saveNotificationToHistory(msg, type);
    if (this.notifyCallback) {
      this.notifyCallback(msg, type);
    }
  }

  /**
   * 將通知存入歷史紀錄 (localStorage)
   * 限制最多保留 50 條最近信號。
   */
  private saveNotificationToHistory(message: string, type: ToastType) {
    const historyKey = 'chronos_notification_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const newEntry: NotificationHistoryEntry = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  }

  /**
   * 獲取所有通訊歷史存檔
   */
  getNotificationHistory(): NotificationHistoryEntry[] {
    const historyKey = 'chronos_notification_history';
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
  }

  /**
   * 擦除所有通訊存檔
   */
  clearNotificationHistory() {
    localStorage.setItem('chronos_notification_history', JSON.stringify([]));
  }

  /**
   * 獲取並計算當前活躍屬性
   * 包含核心演算法：根據上次同步到現在的時間差，計算屬性的「熵增衰減」。
   */
  private async getActiveAttributes(): Promise<CoreAttributes> {
    const stored = localStorage.getItem(this.ATTR_KEY);
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const now = Date.now();

    // 初始屬性值
    let attrs: CoreAttributes = stored 
      ? JSON.parse(stored) 
      : { health: 0.7, mind: 0.5, skill: 0.4, social: 0.6, adventure: 0.3, spirit: 0.5 };

    // 計算衰減
    if (lastSync) {
      const hoursPassed = (now - parseInt(lastSync)) / (1000 * 60 * 60);
      const decay = hoursPassed * this.ENTROPY_RATE;
      attrs = {
        health: Math.max(0.1, attrs.health - decay),
        mind: Math.max(0.1, attrs.mind - decay),
        skill: Math.max(0.1, attrs.skill - decay),
        social: Math.max(0.1, attrs.social - decay),
        adventure: Math.max(0.1, attrs.adventure - decay),
        spirit: Math.max(0.1, attrs.spirit - decay),
      };
    }

    // 更新狀態
    localStorage.setItem(this.ATTR_KEY, JSON.stringify(attrs));
    localStorage.setItem(this.LAST_SYNC_KEY, now.toString());
    return attrs;
  }

  /**
   * 應用屬性增長
   * 當用戶完成任務或記錄日誌時，提升對應的維度評分。
   */
  private async applyGrowth(growth: Partial<CoreAttributes>) {
    const attrs = await this.getActiveAttributes();
    const updated = {
      health: Math.min(1.0, attrs.health + (growth.health || 0)),
      mind: Math.min(1.0, attrs.mind + (growth.mind || 0)),
      skill: Math.min(1.0, attrs.skill + (growth.skill || 0)),
      social: Math.min(1.0, attrs.social + (growth.social || 0)),
      adventure: Math.min(1.0, attrs.adventure + (growth.adventure || 0)),
      spirit: Math.min(1.0, attrs.spirit + (growth.spirit || 0)),
    };
    localStorage.setItem(this.ATTR_KEY, JSON.stringify(updated));
  }

  /**
   * API 請求模擬封裝
   * 使用 localStorage 模擬後端數據庫，添加延遲以模擬真實通訊感。
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { method = 'GET', body } = options;
    const storageKey = `chronos_v3_${endpoint.replace(/\//g, '_')}`;
    
    // 模擬網絡延遲 (600ms)
    await new Promise(resolve => setTimeout(resolve, 600)); 

    if (method === 'GET') {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
      // 提供初始 Mock 數據
      if (endpoint === 'settings') return INITIAL_SETTINGS as unknown as T;
      if (endpoint === 'milestones') return MOCK_MILESTONES as unknown as T;
      if (endpoint === 'logs') return MOCK_LOGS as unknown as T;
      if (endpoint === 'daily_tasks') return [] as unknown as T;
      if (endpoint === 'daily_history') return [] as unknown as T;
      if (endpoint === 'user_profile') return { name: 'Chronos Pioneer' } as unknown as T;
      return null as unknown as T;
    }
    if (method === 'POST' || method === 'PUT') {
      const data = JSON.parse(body as string);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return data as T;
    }
    throw new Error(`Method ${method} not implemented`);
  }

  /**
   * 用戶登入協議
   * 支持密碼或 8 位摩斯密碼驗證。
   */
  async login(email: string, password?: string, morseCode?: string): Promise<{ name: string; success: boolean }> {
    const usersKey = 'chronos_users_list';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    const user = users.find((u: any) => u.email === email && (morseCode ? u.morseCode === morseCode : u.password === password));
    
    if (user || (email === 'test@chronos.com' && (password === '123456' || morseCode === '........'))) {
      const name = user?.name || 'Chronos Pioneer';
      await this.updateUserProfile({ name });
      await this.getActiveAttributes();
      return { name, success: true };
    }
    throw new Error('IDENTITY_MISMATCH: ACCESS_DENIED');
  }

  /**
   * 初始化連結 (註冊)
   */
  async register(name: string, email: string, password: string, morseCode?: string): Promise<{ name: string; success: boolean }> {
    const usersKey = 'chronos_users_list';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    if (users.find((u: any) => u.email === email)) throw new Error('SIGNAL_COLLISION: USER_EXISTS');
    
    const newUser = { name, email, password, morseCode };
    users.push(newUser);
    localStorage.setItem(usersKey, JSON.stringify(users));
    await this.updateUserProfile({ name });
    return { name, success: true };
  }

  /**
   * 獲取指揮官個人檔案
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.apiRequest<UserProfile>('user_profile');
  }

  /**
   * 更新指揮官資料
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getUserProfile();
    const updated = { ...current, ...profile };
    return this.apiRequest<UserProfile>('user_profile', { method: 'PUT', body: JSON.stringify(updated) });
  }

  /**
   * 獲取飛船配置 (設置)
   */
  async getSettings(): Promise<UserSettings> {
    return this.apiRequest<UserSettings>('settings');
  }

  /**
   * 更新飛船配置
   * 包含健康增長邏輯：如果睡眠時長處於黃金區間，提升健康屬性。
   */
  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    if (settings.todaySleepTime >= 7 && settings.todaySleepTime <= 9) {
      await this.applyGrowth({ health: 0.05 });
    }
    return this.apiRequest<UserSettings>('settings', { method: 'PUT', body: JSON.stringify(settings) });
  }

  /**
   * 獲取 A 計劃：任務目標
   */
  async getMilestones(): Promise<Milestone[]> {
    return this.apiRequest<Milestone[]>('milestones');
  }

  /**
   * 儲存任務目標
   * 當新任務達成時，顯著提升冒險與技能評分。
   */
  async saveMilestones(milestones: Milestone[]): Promise<void> {
    const oldMilestones = await this.getMilestones();
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const prevCompletedCount = oldMilestones.filter(m => m.status === 'completed').length;
    if (completedCount > prevCompletedCount) {
      await this.applyGrowth({ adventure: 0.15, skill: 0.15 });
    }
    await this.apiRequest<Milestone[]>('milestones', { method: 'POST', body: JSON.stringify(milestones) });
  }

  /**
   * 獲取 B 計劃：每日頻率
   * 自動邏輯：檢測跨日，若當前日期與末次同步日期不同，重置打卡狀態。
   */
  async getDailyTasks(): Promise<DailyTask[]> {
    const tasks = await this.apiRequest<DailyTask[]>('daily_tasks');
    const today = new Date().toISOString().split('T')[0];
    
    const updatedTasks = tasks.map(task => {
      const taskDay = task.lastCompleted?.split('T')[0];
      if (taskDay !== today) {
        return { ...task, completed: false };
      }
      return task;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      await this.saveDailyTasks(updatedTasks);
    }
    return updatedTasks;
  }

  /**
   * 儲存每日任務列表
   */
  async saveDailyTasks(tasks: DailyTask[]): Promise<void> {
    await this.apiRequest<DailyTask[]>('daily_tasks', { method: 'POST', body: JSON.stringify(tasks) });
  }

  /**
   * 切換每日任務狀態 (打卡)
   * 更新連擊次數並提升精神與思維屬性。
   */
  async toggleDailyTask(id: string): Promise<DailyTask[]> {
    const tasks = await this.getDailyTasks();
    const today = new Date().toISOString();
    const updated = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        const streak = nextCompleted ? task.streak + 1 : Math.max(0, task.streak - 1);
        if (nextCompleted) this.applyGrowth({ spirit: 0.02, mind: 0.01 });
        return { ...task, completed: nextCompleted, streak, lastCompleted: nextCompleted ? today : task.lastCompleted };
      }
      return task;
    });
    await this.saveDailyTasks(updated);
    return updated;
  }

  /**
   * 添加新的每日頻率
   */
  async addDailyTask(title: string): Promise<DailyTask[]> {
    const tasks = await this.getDailyTasks();
    const newTask: DailyTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      streak: 0
    };
    const updated = [...tasks, newTask];
    await this.saveDailyTasks(updated);
    return updated;
  }

  /**
   * 歸檔每日任務
   * 將任務從活躍列表移除，並以「已同步」或「已中止」狀態存入歷史檔案。
   */
  async archiveDailyTask(id: string, status: 'completed' | 'aborted'): Promise<void> {
    const tasks = await this.getDailyTasks();
    const taskToArchive = tasks.find(t => t.id === id);
    if (!taskToArchive) return;

    const history = await this.getDailyHistory();
    const historyEntry: DailyTaskHistory = {
      id: Date.now().toString(),
      title: taskToArchive.title,
      status,
      timestamp: new Date().toISOString(),
      finalStreak: taskToArchive.streak
    };

    const updatedTasks = tasks.filter(t => t.id !== id);
    const updatedHistory = [historyEntry, ...history];

    await Promise.all([
      this.saveDailyTasks(updatedTasks),
      this.apiRequest<DailyTaskHistory[]>('daily_history', { method: 'POST', body: JSON.stringify(updatedHistory) })
    ]);
  }

  /**
   * 獲取頻率時間歷史檔案
   */
  async getDailyHistory(): Promise<DailyTaskHistory[]> {
    return this.apiRequest<DailyTaskHistory[]>('daily_history');
  }

  /**
   * 刪除特定歷史檔案條目
   */
  async deleteDailyHistoryEntry(id: string): Promise<DailyTaskHistory[]> {
    const history = await this.getDailyHistory();
    const updated = history.filter(h => h.id !== id);
    await this.apiRequest<DailyTaskHistory[]>('daily_history', { method: 'POST', body: JSON.stringify(updated) });
    return updated;
  }

  /**
   * 獲取所有通訊日誌 (Logs)
   */
  async getLogs(): Promise<LogEntry[]> {
    return this.apiRequest<LogEntry[]>('logs');
  }

  /**
   * 分頁獲取通訊日誌
   * 用於日誌流的滾動加載。
   */
  async getLogsPaginated(page: number, pageSize: number): Promise<{ data: LogEntry[]; hasMore: boolean }> {
    const allLogs = await this.getLogs();
    const start = page * pageSize;
    const end = start + pageSize;
    return { data: allLogs.slice(start, end), hasMore: end < allLogs.length };
  }

  /**
   * 儲存日誌列表
   */
  async saveLogs(logs: LogEntry[]): Promise<void> {
    await this.apiRequest<LogEntry[]>('logs', { method: 'POST', body: JSON.stringify(logs) });
  }

  /**
   * 發送並儲存新傳輸 (添加日誌)
   * 根據日誌屬性（是否高亮、有無影像、有無語音）計算多維度的屬性增長。
   */
  async addLog(entry: LogEntry): Promise<LogEntry> {
    const currentLogs = await this.getLogs();
    const updated = [entry, ...currentLogs];
    await this.saveLogs(updated);
    
    const spiritGain = entry.isHighlight ? 0.08 : 0.04;
    const adventureGain = entry.images && entry.images.length > 0 ? 0.05 : 0;
    const skillGain = entry.hasVoice ? 0.05 : 0;
    
    await this.applyGrowth({ 
      spirit: spiritGain, 
      mind: 0.03,
      adventure: adventureGain,
      skill: skillGain 
    });
    
    return entry;
  }

  /**
   * 擦除單條通訊日誌
   * 若包含 IndexedDB 中的文件引用，會同步清理磁盤空間。
   */
  async deleteLog(logId: string): Promise<void> {
    const currentLogs = await this.getLogs();
    const entryToDelete = currentLogs.find(l => l.id === logId);
    if (entryToDelete?.voiceData && entryToDelete.voiceData.startsWith('idb://')) {
      await this.removeFile(entryToDelete.voiceData);
    }
    const updated = currentLogs.filter(log => log.id !== logId);
    await this.saveLogs(updated);
  }

  /**
   * 獲取致未來的傳輸 (信件)
   * 支持密鑰解密邏輯：若未提供正確密鑰，內容將顯示為 [ENCRYPTED]。
   */
  async getFutureLetter(key?: string): Promise<FutureLetter | { status: 'none' }> {
    const storageKey = 'chronos_v3_future_letter';
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { status: 'none' };
    const letter = JSON.parse(stored) as FutureLetter;
    if (letter.status === 'open') return letter;
    if (!key) return { ...letter, content: "[ENCRYPTED]", decryptionKey: undefined, status: 'encrypted' };
    if (key === letter.decryptionKey) return { ...letter, status: 'open' };
    throw new Error("ACCESS_DENIED");
  }

  /**
   * 封存致未來的傳輸
   * 生成隨機摩斯密鑰（若用戶未自定義）。
   */
  async saveFutureLetter(letter: Omit<FutureLetter, 'decryptionKey' | 'status'> & { decryptionKey?: string }): Promise<FutureLetter> {
    let finalKey = letter.decryptionKey || Array.from({ length: 6 }).map(() => (Math.random() > 0.5 ? '.' : '-')).join('');
    const letterWithKey: FutureLetter = { ...letter, decryptionKey: finalKey, status: 'encrypted' };
    return this.apiRequest<FutureLetter>('future_letter', { method: 'PUT', body: JSON.stringify(letterWithKey) });
  }

  /**
   * 獲取綜合分析報告
   * 包含屬性矩陣、情緒穩定度以及思維專注度計算。
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    const attributes = await this.getActiveAttributes();
    return {
      attributes,
      soul: { moodStability: 85 + (attributes.spirit * 10) },
      mind: { focusScore: Math.round(attributes.mind * 100), booksRead: 12 }
    };
  }

  /**
   * 上傳文件至 IndexedDB
   * 將 Blob 轉換為內部標識符 (idb://file_...) 並存儲。
   */
  async uploadFile(file: File | Blob): Promise<string> {
    const db = await this.initDB();
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(file, id);
      request.onsuccess = () => resolve(`idb://${id}`);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 從 IndexedDB 提取文件 Blob
   */
  async getFileBlob(path: string): Promise<Blob | null> {
    if (!path.startsWith('idb://')) return null;
    const id = path.replace('idb://', '');
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 從 IndexedDB 物理刪除文件
   */
  private async removeFile(path: string): Promise<void> {
    if (!path.startsWith('idb://')) return;
    const id = path.replace('idb://', '');
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 向 TARS 顧問發送諮詢
   * 調用 Google Gemini API 並傳入自定義的誠實度與幽默感配置作為 System Instruction。
   */
  async askTARS(prompt: string, honesty: number, humor: number, language: 'en' | 'zh-TW'): Promise<string> {
    try {
      // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // const response = await ai.models.generateContent({
      //   model: 'gemini-3-pro-preview',
      //   contents: prompt,
      //   config: {
      //     systemInstruction: `你現在是《星際效應》中的 TARS 機器人。目前的校準參數：誠實度=${honesty}%，幽默感=${humor}%。使用語言：${language}。你的回答應該體現出軍事化的高效，同時根據幽默感參數適時開一些冷玩笑。`,
      //     temperature: 0.8,
      //   },
      // });
      return "信號中斷，請重新發送。";
      // return response.text || "信號中斷，請重新發送。";
    } catch (error) {
      throw new Error("AI_OFFLINE: 超空間通訊失敗");
    }
  }
}

// 導出單例執行個體
export const backend = new BackendService();