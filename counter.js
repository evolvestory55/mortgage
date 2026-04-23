// counter.js — Firebase Realtime Counter
(function() {
  'use strict';

  // Firebase config — kendi bilgilerinle değiştir
  const firebaseConfig = {
    apiKey: "AIzaSyCL_9MOOGKYxh56s1tA9vDFru64dUqH54Q",
    authDomain: "mortgage-tools-counter.firebaseapp.com",
    databaseURL: "https://mortgage-tools-counter-default-rtdb.firebaseio.com",
    projectId: "mortgage-tools-counter",
    storageBucket: "mortgage-tools-counter.appspot.com",
    messagingSenderId: "163299541630",
    appId: "1:163299541630:web:de01fb43267cffd5658e2f"
  };

  // Firebase SDK yükle
  const script1 = document.createElement('script');
  script1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
  script1.onload = function() {
    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
    script2.onload = initCounter;
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);

  function initCounter() {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Ziyaretçi ID
    let vid = localStorage.getItem('mt_vid');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('mt_vid', vid);
    }

    // Online tracking — bağlantı durumu
    const onlineRef = db.ref('online/' + vid);
    const statsRef = db.ref('stats');

    // Bağlantı durumunu izle
    const connectedRef = db.ref('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        // Çevrimiçi olarak işaretle
        onlineRef.set({
          page: location.pathname.split('/').pop() || 'index.html',
          time: firebase.database.ServerValue.TIMESTAMP
        });

        // Bağlantı kesilince otomatik sil
        onlineRef.onDisconnect().remove();
      }
    });

    // Toplam görüntülemeyi artır
    statsRef.child('views').transaction(function(current) {
      return (current || 0) + 1;
    });

    // Yeni ziyaretçi mi?
    const visitedKey = 'mt_visited';
    if (!localStorage.getItem(visitedKey)) {
      statsRef.child('visitors').transaction(function(current) {
        return (current || 0) + 1;
      });
      localStorage.setItem(visitedKey, '1');
    }

    // Sayaç widget'ını göster
    statsRef.on('value', function(snap) {
      const stats = snap.val() || {};
      updateCounterWidget(stats.views || 0, stats.visitors || 0);
    });

    // Online sayısını göster
    db.ref('online').on('value', function(snap) {
      const count = snap.numChildren();
      updateOnlineCount(count);
    });
  }

  function updateCounterWidget(views, visitors) {
    const el = document.getElementById('counter-widget');
    if (!el) return;
    el.querySelector('.cw-views').textContent = formatNum(views);
    el.querySelector('.cw-visitors').textContent = formatNum(visitors);
  }

  function updateOnlineCount(count) {
    const el = document.getElementById('counter-widget');
    if (!el) return;
    el.querySelector('.cw-online').textContent = count;
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
})();
