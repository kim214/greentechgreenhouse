package com.example.greentechlogin

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.animation.DecelerateInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.airbnb.lottie.LottieAnimationView

class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // ✅ Install native splash screen for Android 12+
        installSplashScreen()

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // ✅ Get views
        val lottieView = findViewById<LottieAnimationView>(R.id.lottieBackground)
        val logo = findViewById<ImageView>(R.id.logoImage)
        val name = findViewById<TextView>(R.id.appName)

        // ✅ Configure the Lottie animation
        lottieView.apply {
            speed = 0.8f
            playAnimation()
            loop(true)
        }

        // ✅ Create smooth fade + scale + slide-up animation for logo
        val fadeLogo = ObjectAnimator.ofFloat(logo, "alpha", 0f, 1f).apply {
            duration = 1000
            interpolator = DecelerateInterpolator()
        }
        val scaleLogoX = ObjectAnimator.ofFloat(logo, "scaleX", 0.7f, 1f).apply {
            duration = 1000
            interpolator = DecelerateInterpolator()
        }
        val scaleLogoY = ObjectAnimator.ofFloat(logo, "scaleY", 0.7f, 1f).apply {
            duration = 1000
            interpolator = DecelerateInterpolator()
        }
        val slideUpLogo = ObjectAnimator.ofFloat(logo, "translationY", 80f, 0f).apply {
            duration = 1000
            interpolator = DecelerateInterpolator()
        }

        // ✅ Fade-in text slightly after logo
        val fadeText = ObjectAnimator.ofFloat(name, "alpha", 0f, 1f).apply {
            startDelay = 700
            duration = 900
            interpolator = DecelerateInterpolator()
        }

        // ✅ Play all animations together
        AnimatorSet().apply {
            playTogether(fadeLogo, scaleLogoX, scaleLogoY, slideUpLogo, fadeText)
            start()
        }

        // ✅ Move to Welcome screen after a short delay
        Handler(Looper.getMainLooper()).postDelayed({
            val intent = Intent(this, WelcomeActivity::class.java)
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 2800)
    }
}
