package com.example.greentechlogin

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.example.greentechlogin.MainActivity
import com.example.greentechlogin.R
import com.example.greentechlogin.SignupActivity

class WelcomeActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.welcome_activity)

        val signInButton = findViewById<Button>(R.id.btnSignIn)
        val signUpButton = findViewById<Button>(R.id.btnSignUp)

        signInButton.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }

        signUpButton.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            startActivity(intent)
        }
    }
}
