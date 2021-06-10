'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "77a76de386ef343a83c63a896c4bb7ed",
"index.html": "ade26a3ae7b0d1a24e78ec54fdde9f72",
"/": "ade26a3ae7b0d1a24e78ec54fdde9f72",
"main.dart.js": "5ac0e6355c7dfcf2c63f9e91813a3707",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "49c3d0f0060b81fb6408c9a64eb638a5",
"assets/AssetManifest.json": "3affaf2ac4bdb6756a433c7c20e7a46e",
"assets/NOTICES": "2a7d990ed8759e522bd0598c3b1e1c50",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/images/coin_model.png": "4dd8d1ff0dea5a2903cbb73a4987e7c6",
"assets/assets/images/icon_bottom.png": "3014fd99ee7a5775bd7e1362d1527929",
"assets/assets/images/wallet.png": "61e5bb2dc1e73319d2745d1b76b93eda",
"assets/assets/images/BNB_bg.png": "9c01a1f3ef3de659d42cdf0aefb7fe5a",
"assets/assets/images/icon_fad_2@2x.png": "d8417ca7a0782c4115993bc4332870b7",
"assets/assets/images/banner.png": "3bce394fecb31eff24551daee3d785d6",
"assets/assets/images/icon_left.png": "39ac0d53e3e6a580e69e4dd625e2daa8",
"assets/assets/images/buy_bottom.png": "e79fd5e5c2a2f8de1002067683bbdb15",
"assets/assets/images/icon_fad_6@2x.png": "80931c7484e927c1b65c3d424197487d",
"assets/assets/images/height_trade.png": "7637b1358f2056dddc03d88d86a6e7db",
"assets/assets/images/icon_fad_4@2x.png": "dc622ff8c02b1015a5a8eb238a3bcf61",
"assets/assets/images/icon_fad_10@2x.png": "c8c1fd29660d8dbc3d5f3ef1dbfbb883",
"assets/assets/images/icon_fad_8@2x.png": "9e79f87e3fba28b51ff56636d31a74e2",
"assets/assets/images/claimBNB.jpg": "0020256aa3ebee4e7f1fa2f23f18333e",
"assets/assets/images/price.png": "320310d049a58506c46e0f70c4581e6a",
"assets/assets/images/icon_fad_1@2x.png": "b5d6a4fb33cc8e2415a790af8d39c431",
"assets/assets/images/icon_fad_3@2x.png": "c5a4d410ee82557130415772a751cbc0",
"assets/assets/images/Timeline.jpg": "5a94c5d4bab62d69051a81ba5e05f276",
"assets/assets/images/logo@2x.png": "1f5e49d3fb6418aa1ce5235198c6a35a",
"assets/assets/images/all_liquify.png": "2e6a964cd428799165cc4efd4c495d79",
"assets/assets/images/BNB_rewad_pool.png": "7dd777688a49991bac30e6087b994da7",
"assets/assets/images/icon_fad_7@2x.png": "88a7652704c6973708502f5f22968595",
"assets/assets/images/BNN_reward.png": "1315a3c98432f4d96f8feba1b4edd549",
"assets/assets/images/BNB_liquify.png": "abc2ffa48316bcb87e57e89c847bebbf",
"assets/assets/images/icon_fad_5@2x.png": "76e68e966aa5ef8a1ddfb07fc05e397a",
"assets/assets/images/icon_fad_9@2x.png": "1cc72a309ebdaaca244e875852cc0c61",
"assets/assets/abi.json": "ecc446a946b3f13d214016da75e79117"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
