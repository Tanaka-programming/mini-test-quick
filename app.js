// LIFFアプリケーションのメインスクリプト
class LiffApp {
    constructor() {
        this.liffId = '2008142180-LRyYxYa5'; // 実際のLIFF IDに置き換えてください
        this.isLiffReady = false;
        this.profile = null;
        this.dummyData = null;
        
        this.init();
    }

    async init() {
        try {
            // LIFFの初期化
            await this.initLiff();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 初期データの取得
            await this.loadInitialData();
            
        } catch (error) {
            console.error('アプリの初期化に失敗しました:', error);
            this.updateStatus('エラー: ' + error.message, 'error');
        }
    }

    async initLiff() {
        return new Promise((resolve, reject) => {
            liff.init({ liffId: this.liffId })
                .then(() => {
                    this.isLiffReady = true;
                    this.updateStatus('LIFF初期化完了', 'success');
                    resolve();
                })
                .catch((error) => {
                    this.updateStatus('LIFF初期化失敗: ' + error.message, 'error');
                    reject(error);
                });
        });
    }

    setupEventListeners() {
        // ダミーデータ取得ボタン
        document.getElementById('get-dummy-btn').addEventListener('click', () => {
            this.getDummyData();
        });

        // リフレッシュボタン
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // クリアボタン
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearData();
        });
    }

    async loadInitialData() {
        if (!this.isLiffReady) {
            this.updateStatus('LIFFが初期化されていません', 'error');
            return;
        }

        try {
            // プロフィール情報の取得
            await this.getProfile();
            
            // ダミーデータの取得
            await this.getDummyData();
            
        } catch (error) {
            console.error('データの取得に失敗しました:', error);
            this.updateStatus('データ取得エラー: ' + error.message, 'error');
        }
    }

    async getProfile() {
        try {
            if (liff.isLoggedIn()) {
                this.profile = await liff.getProfile();
                this.displayProfile(this.profile);
            } else {
                this.displayProfile({ message: 'ログインしていません' });
            }
        } catch (error) {
            console.error('プロフィール取得エラー:', error);
            this.displayProfile({ error: error.message });
        }
    }

    async getDummyData() {
        try {
            if (!this.isLiffReady) {
                throw new Error('LIFFが初期化されていません');
            }

            // liff.$commonProfile.getDummy() の使用
            if (typeof liff.$commonProfile !== 'undefined' && 
                typeof liff.$commonProfile.getDummy === 'function') {
                
                this.dummyData = await liff.$commonProfile.getDummy();
                this.displayDummyData(this.dummyData);
                this.updateStatus('ダミーデータ取得成功', 'success');
                
            } else {
                // getDummy()が利用できない場合の代替実装
                this.dummyData = this.createMockDummyData();
                this.displayDummyData(this.dummyData);
                this.updateStatus('ダミーデータ（モック）取得成功', 'warning');
            }
            
        } catch (error) {
            console.error('ダミーデータ取得エラー:', error);
            this.displayDummyData({ error: error.message });
            this.updateStatus('ダミーデータ取得エラー: ' + error.message, 'error');
        }
    }

    createMockDummyData() {
        // getDummy()が利用できない場合のモックデータ
        return {
            userId: 'dummy_user_12345',
            displayName: 'ダミーユーザー',
            pictureUrl: 'https://via.placeholder.com/150x150?text=Dummy',
            statusMessage: 'これはダミーデータです',
            timestamp: new Date().toISOString(),
            mock: true
        };
    }

    displayProfile(profile) {
        const profileElement = document.getElementById('profile-info');
        
        if (profile.error) {
            profileElement.innerHTML = `<p class="error">エラー: ${profile.error}</p>`;
            return;
        }

        if (profile.message) {
            profileElement.innerHTML = `<p class="warning">${profile.message}</p>`;
            return;
        }

        profileElement.innerHTML = `
            <div class="profile-card">
                <img src="${profile.pictureUrl || 'https://via.placeholder.com/100x100'}" 
                     alt="プロフィール画像" class="profile-image">
                <div class="profile-details">
                    <h3>${profile.displayName || '不明'}</h3>
                    <p><strong>ユーザーID:</strong> ${profile.userId || '不明'}</p>
                    <p><strong>ステータスメッセージ:</strong> ${profile.statusMessage || 'なし'}</p>
                </div>
            </div>
        `;
    }

    displayDummyData(dummyData) {
        const dummyElement = document.getElementById('dummy-info');
        
        if (dummyData.error) {
            dummyElement.innerHTML = `<p class="error">エラー: ${dummyData.error}</p>`;
            return;
        }

        const mockIndicator = dummyData.mock ? '<span class="mock-indicator">（モックデータ）</span>' : '';
        
        dummyElement.innerHTML = `
            <div class="dummy-card">
                <h3>ダミーデータ ${mockIndicator}</h3>
                <div class="dummy-details">
                    <p><strong>ユーザーID:</strong> ${dummyData.userId || '不明'}</p>
                    <p><strong>表示名:</strong> ${dummyData.displayName || '不明'}</p>
                    <p><strong>画像URL:</strong> <a href="${dummyData.pictureUrl || '#'}" target="_blank">${dummyData.pictureUrl || 'なし'}</a></p>
                    <p><strong>ステータスメッセージ:</strong> ${dummyData.statusMessage || 'なし'}</p>
                    <p><strong>取得時刻:</strong> ${dummyData.timestamp || '不明'}</p>
                </div>
            </div>
        `;
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('liff-status');
        statusElement.innerHTML = `<p class="${type}">${message}</p>`;
        
        // ボタンの有効/無効を制御
        const dummyBtn = document.getElementById('get-dummy-btn');
        dummyBtn.disabled = !this.isLiffReady;
    }

    async refreshData() {
        this.updateStatus('データを更新中...', 'info');
        await this.loadInitialData();
    }

    clearData() {
        this.profile = null;
        this.dummyData = null;
        
        document.getElementById('profile-info').innerHTML = '<p>プロフィール情報をクリアしました</p>';
        document.getElementById('dummy-info').innerHTML = '<p>ダミーデータをクリアしました</p>';
        this.updateStatus('データをクリアしました', 'info');
    }
}

// アプリケーションの開始
document.addEventListener('DOMContentLoaded', () => {
    new LiffApp();
});

