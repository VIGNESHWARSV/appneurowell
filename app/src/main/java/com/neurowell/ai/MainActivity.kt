package com.neurowell.ai

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import com.neurowell.ai.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private val TAG = "NeuroWellMainActivity"
    private val PERMISSIONS_REQUEST_CODE = 101
    private lateinit var webView: WebView
    private lateinit var binding: ActivityMainBinding

    private val REQUIRED_PERMISSIONS = arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.MODIFY_AUDIO_SETTINGS
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        webView = binding.webview
        setupWebView()

        if (!hasPermissions()) {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, PERMISSIONS_REQUEST_CODE)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.android.com")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldInterceptRequest(view: WebView, url: String): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(Uri.parse(url))
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                return handleUrlOverride(view, request.url.toString())
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return handleUrlOverride(view, url)
            }

            private fun handleUrlOverride(view: WebView, url: String): Boolean {
                if (url.startsWith("https://appassets.android.com")) {
                    return false
                }
                if (url.startsWith("intent://")) {
                    try {
                        val context = view.context
                        val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                        if (intent.resolveActivity(context.packageManager) != null) {
                            context.startActivity(intent)
                        } else {
                            val fallbackUrl = intent.getStringExtra("browser_fallback_url")
                            if (fallbackUrl != null) {
                                view.loadUrl(fallbackUrl)
                            }
                        }
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "URI syntax exception: " + e.message)
                    }
                    return true
                }
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("http:") || url.startsWith("https:")) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    view.context.startActivity(intent)
                    return true
                }
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                Log.d(TAG, "onPermissionRequest: granting resources")
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        webView.loadUrl("https://appassets.android.com/assets/index.html")
    }

    private fun hasPermissions(): Boolean {
        for (permission in REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (!allGranted) {
                Toast.makeText(this, "Camera and audio permissions are required for emotional biomarker scanning.", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onBackPressed() {
        if (::webView.isInitialized) {
            webView.evaluateJavascript(
                "(function() {\n" +
                        "    const activeEl = document.querySelector('.view.active');\n" +
                        "    if (activeEl) {\n" +
                        "        const id = activeEl.id.replace('view-', '');\n" +
                        "        if (id === '16-dashboard-main' || id === '2-welcome' || id === '1-splash') {\n" +
                        "            return false;\n" +
                        "        } else {\n" +
                        "            const backBtn = activeEl.querySelector('.back-btn');\n" +
                        "            if (backBtn) {\n" +
                        "                backBtn.click();\n" +
                        "                return true;\n" +
                        "            } else {\n" +
                        "                window.navigate('16-dashboard-main');\n" +
                        "                return true;\n" +
                        "            }\n" +
                        "        }\n" +
                        "    }\n" +
                        "    return false;\n" +
                        "})()"
            ) { value ->
                if (value == "true") {
                    Log.d(TAG, "Back button handled inside the WebView SPA")
                } else {
                    super.onBackPressed()
                }
            }
        } else {
            super.onBackPressed()
        }
    }
}
