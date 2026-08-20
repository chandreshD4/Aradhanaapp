package com.aradhana.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    private RewardedAd rewardedAd;
    // AdMob Official Test Rewarded Ad Unit ID (प्ले स्टोर पब्लिश करते समय असली ID डालें)
    private static final String AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917"; 

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // AdMob Initialize
        MobileAds.initialize(this, initializationStatus -> {});

        // WebView Setup
        myWebView = new WebView(this);
        setContentView(myWebView);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);

        // Javascript Bridge Connection (window.AradhanaAdBridge)
        myWebView.addJavascriptInterface(new AradhanaAdBridge(this), "AradhanaAdBridge");
        myWebView.setWebViewClient(new WebViewClient());

        // assets/index.html लोड करना
        myWebView.loadUrl("file:///android_asset/index.html");

        // एड लोड करना
        loadRewardedAd();
    }

    public void loadRewardedAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        RewardedAd.load(this, AD_UNIT_ID, adRequest, new RewardedAdLoadCallback() {
            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                rewardedAd = null;
            }

            @Override
            public void onAdLoaded(@NonNull RewardedAd ad) {
                rewardedAd = ad;
            }
        });
    }

    public void showAdMobRewardedAd(final String adType) {
        if (rewardedAd != null) {
            rewardedAd.show(this, new OnUserEarnedRewardListener() {
                @Override
                public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
                    // विज्ञापन सफ़लतापूर्वक पूरा देखने पर JS Callbacks भेजना
                    if ("pdf".equals(adType)) {
                        myWebView.loadUrl("javascript:window.onPdfRewardSuccess()");
                    } else if ("premium".equals(adType)) {
                        myWebView.loadUrl("javascript:window.onPremiumAdRewarded()");
                    } else if ("global".equals(adType)) {
                        myWebView.loadUrl("javascript:window.onGlobalAdRewarded()");
                    }
                    loadRewardedAd(); // अगला एड लोड करना
                }
            });
        } else {
            Toast.makeText(this, "विज्ञापन अभी लोड हो रहा है, कृपया पुनः प्रयास करें", Toast.LENGTH_SHORT).show();
            loadRewardedAd();
            
            // Testing Fallback
            if ("pdf".equals(adType)) {
                myWebView.loadUrl("javascript:window.onPdfRewardSuccess()");
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
