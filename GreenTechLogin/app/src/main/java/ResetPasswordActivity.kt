package com.example.greentechlogin

import SupabaseClient
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ResetPasswordActivity : AppCompatActivity() {

    private lateinit var newPasswordInput: EditText
    private lateinit var confirmNewPasswordInput: EditText
    private lateinit var resetPasswordBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reset_password)

        newPasswordInput = findViewById(R.id.newPasswordInput)
        confirmNewPasswordInput = findViewById(R.id.confirmNewPasswordInput)
        resetPasswordBtn = findViewById(R.id.resetPasswordBtn)

        // Get token from intent extras
        val accessToken = intent.getStringExtra("access_token") ?: ""

        if (accessToken.isEmpty()) {
            Toast.makeText(this, "Invalid password reset token.", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        resetPasswordBtn.setOnClickListener {
            val newPassword = newPasswordInput.text.toString()
            val confirmPassword = confirmNewPasswordInput.text.toString()

            if (newPassword.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPassword != confirmPassword) {
                Toast.makeText(this, "Passwords do not match.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Call Supabase API to update password
            val body = mapOf(
                "access_token" to accessToken,
                "password" to newPassword
            )

            val call = SupabaseClient.authService.updatePassword(body)

            call.enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ResetPasswordActivity, "Password reset successful! Please login.", Toast.LENGTH_LONG).show()
                        finish()  // Go back to login
                    } else {
                        Toast.makeText(this@ResetPasswordActivity, "Failed to reset password.", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@ResetPasswordActivity, "Error: ${t.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            })
        }
    }
}
