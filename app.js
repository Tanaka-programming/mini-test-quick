// app.js（モックなし・エラー表示版）

class LiffApp {
  constructor() {
    this.liffId = '2008142178-4kM8l8Ea'; // 指定のLIFF ID
    this.isLiffReady = false;
    this.hasDummyApi = false;
    this.profile = null;
    this.dummyData = null;

    document.addEventListener('DOMContentLoaded', () => {
      this.cacheDom();
      this.init().catch((e) => {
        console.error('初期化失敗:', e);
        this.updateStatus('エラー: ' + (e?.message || e), 'error');
      });
    });
  }

  cacheDom() {
    this.$ = {
      status: document.getElementById('liff-status'),
      profile: document.getElementById('profile-info'),
      dummy: document.getElementById('dummy-info'),
      btnDummy: document.getElementById('get-dummy-btn'),
      btnRefresh: document.getElementById('refresh-btn'),
      btnClear: document.getElementById('clear-btn'),
    };
  }

  async init() {
    try {
      await this.initLiff();
      this.setupEventListeners();
      await this.loadInitialData();
    } catch (error) {
      console.error('アプリの初期化に失敗しました:', error);
      this.updateStatus('エラー: ' + (error?.message || error), 'error');
      throw error;
    }
  }

  async initLiff() {
    if (typeof window.liff === 'undefined') {
      throw new Error('LIFF SDKが読み込まれていません。スクリプトの順序を確認してください。');
    }

    await liff.init({ liffId: this.liffId });
    this.isLiffReady = true;

    // 利用可否をここで判定（モックは作らない）
    this.hasDummyApi =
      !!(liff.$commonProfile && typeof liff.$commonProfile.getDummy === 'function');

    const where = liff.isInClient() ? 'LINEアプリ内' : '外部ブラウザ';
    this.updateStatus(`LIFF初期化完了（${where}）`, 'success');

    if (!this.hasDummyApi) {
      // 事前に分かっているなら情報として通知（取得時にもエラー表示します）
      this.appendInfo('この環境では liff.$commonProfile.getDummy() は利用できません。');
    }
  }

  setupEventListeners() {
    this.$.btnDummy?.addEventListener('click', () => this.getDummyData());
    this.$.btnRefresh?.addEventListener('click', () => this.refreshData());
    this.$.btnClear?.addEventListener('click', () => this.clearData());
  }

  async loadInitialData() {
    if (!this.isLiffReady) {
      this.updateStatus('LIFFが初期化されていません', 'error');
      return;
    }
    try {
      await this.getProfile();
      await this.getDummyData(); // ここでAPIが無い場合はエラー表示されます
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      this.updateStatus('データ取得エラー: ' + (error?.message || error), 'error');
    }
  }

  async getProfile() {
    try {
      if (liff.isLoggedIn()) {
        this.profile = await liff.getProfile();
        this.displayProfile(this.profile);
      } else {
        this.displayProfile({ message: 'ログインしていません（ログイン後にプロフィールが表示されます）' });
        // 自動ログインさせたい場合は以下を有効化
        // liff.login({ redirectUri: location.href });
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      this.displayProfile({ error: error?.message || String(error) });
    }
  }

  async getDummyData() {
    try {
      if (!this.isLiffReady) {
        throw new Error('LIFFが初期化されていません');
      }
      if (!this.hasDummyApi) {
        // モックは使わず、はっきりエラー表示
        throw new Error('liff.$commonProfile.getDummy() はこのSDK/環境では利用できません。');
      }

      this.dummyData = await liff.$commonProfile.getDummy();
      this.displayDummyData(this.dummyData);
      this.updateStatus('ダミーデータ取得成功', 'success');
    } catch (error) {
      console.error('ダミーデータ取得エラー:', error);
      this.displayDummyData({ error: error?.message || String(error) });
      this.updateStatus('ダミーデータ取得エラー: ' + (error?.message || error), 'error');
    }
  }

  displayProfile(profile) {
    const el = this.$.profile;
    if (!el) return;

    if (profile.error) {
      el.innerHTML = `<p class="error">エラー: ${this.escape(profile.error)}</p>`;
      return;
    }
    if (profile.message) {
      el.innerHTML = `<p class="warning">${this.escape(profile.message)}</p>`;
      return;
    }

    el.innerHTML = `
      <div class="profile-card">
        <img src="${this.escape(profile.pictureUrl || 'https://via.placeholder.com/100x100')}"
             alt="プロフィール画像" class="profile-image">
        <div class="profile-details">
          <h3>${this.escape(profile.displayName || '不明')}</h3>
          <p><strong>ユーザーID:</strong> ${this.escape(profile.userId || '不明')}</p>
          <p><strong>ステータスメッセージ:</strong> ${this.escape(profile.statusMessage || 'なし')}</p>
        </div>
      </div>
    `;
  }

  displayDummyData(dummyData) {
    const el = this.$.dummy;
    if (!el) return;

    if (dummyData.error) {
      el.innerHTML = `<p class="error">エラー: ${this.escape(dummyData.error)}</p>`;
      return;
    }

    const pic = dummyData.pictureUrl || '';
    const picLink = pic
      ? `<a href="${this.escape(pic)}" target="_blank" rel="noopener noreferrer">${this.escape(pic)}</a>`
      : 'なし';

    el.innerHTML = `
      <div class="dummy-card">
        <h3>ダミーデータ</h3>
        <div class="dummy-details">
          <p><strong>ユーザーID:</strong> ${this.escape(dummyData.userId || '不明')}</p>
          <p><strong>表示名:</strong> ${this.escape(dummyData.displayName || '不明')}</p>
          <p><strong>画像URL:</strong> ${picLink}</p>
          <p><strong>ステータスメッセージ:</strong> ${this.escape(dummyData.statusMessage || 'なし')}</p>
          <p><strong>取得時刻:</strong> ${this.escape(dummyData.timestamp || '不明')}</p>
        </div>
      </div>
    `;
  }

  updateStatus(message, type = 'info') {
    if (this.$.status) {
      this.$.status.innerHTML = `<p class="${this.escape(type)}">${this.escape(message)}</p>`;
    }
    if (this.$.btnDummy) {
      // 初期化が終われば押せる（APIが無い場合は押すとエラー表示される）
      this.$.btnDummy.disabled = !this.isLiffReady;
      if (!this.hasDummyApi) {
        this.$.btnDummy.title = 'この環境では getDummy は利用できません。押すとエラーを表示します。';
      }
    }
  }

  async refreshData() {
    this.updateStatus('データを更新中...', 'info');
    await this.loadInitialData();
  }

  clearData() {
    this.profile = null;
    this.dummyData = null;
    if (this.$.profile) this.$.profile.innerHTML = '<p>プロフィール情報をクリアしました</p>';
    if (this.$.dummy) this.$.dummy.innerHTML = '<p>ダミーデータをクリアしました</p>';
    this.updateStatus('データをクリアしました', 'info');
  }

  appendInfo(text) {
    if (!this.$.status) return;
    const div = document.createElement('div');
    div.innerHTML = `<p class="info">${this.escape(text)}</p>`;
    this.$.status.appendChild(div.firstElementChild);
  }

  // 簡易エスケープ
  escape(v) {
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

document.addEventListener('DOMContentLoaded', () => new LiffApp());
