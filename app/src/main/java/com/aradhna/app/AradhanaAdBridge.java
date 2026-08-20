package com.aradhana.app;

import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class AradhanaAdBridge {
    private MainActivity activity;

    public AradhanaAdBridge(MainActivity activity) {
        this.activity = activity;
    }

    // 1. PDF डाउनलोड के लिए AdMob Rewarded Ad ट्रिगर
    @JavascriptInterface
    public void showRewardedAdForPdf() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.showAdMobRewardedAd("pdf");
            }
        });
    }

    // 2. Premium 10-Ads Unlocking के लिए Rewarded Ad ट्रिगर
    @JavascriptInterface
    public void showRewardedAdForPremium() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.showAdMobRewardedAd("premium");
            }
        });
    }

    // 3. Global 50-Click System के लिए Rewarded Ad ट्रिगर
    @JavascriptInterface
    public void showGlobalRewardedAd() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.showAdMobRewardedAd("global");
            }
        });
    }
}
