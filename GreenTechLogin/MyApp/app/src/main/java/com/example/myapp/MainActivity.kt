package com.example.myfirstapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.TextView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val showMessageButton = findViewById<Button>(R.id.showMessageButton)
        val messageTextView = findViewById<TextView>(R.id.messageTextView)

        showMessageButton.setOnClickListener {
            messageTextView.text = "Hello Android!"
        }
    }
}