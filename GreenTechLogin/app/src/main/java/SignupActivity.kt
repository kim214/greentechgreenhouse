package com.example.greentechlogin

import SupabaseClient
import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.airbnb.lottie.LottieAnimationView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

// Data classes for the API request and response
data class AuthRequest(val email: String, val password: String)
data class UserResponse(val id: String, val email: String?)
data class AuthResponse(val access_token: String?, val user: UserResponse?)

class SignupActivity : AppCompatActivity() {

    private lateinit var nameInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var confirmPasswordInput: EditText
    private lateinit var signupBtn: Button
    private lateinit var loginLink: TextView
    private lateinit var successAnim: LottieAnimationView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        // Bind views
        nameInput = findViewById(R.id.nameInput)
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        confirmPasswordInput = findViewById(R.id.confirmPasswordInput)
        signupBtn = findViewById(R.id.signupBtn)
        loginLink = findViewById(R.id.loginLink)
        successAnim = findViewById(R.id.successAnim)

        signupBtn.setOnClickListener {
            val name = nameInput.text.toString().trim()
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString()
            val confirmPassword = confirmPasswordInput.text.toString()

            // Validate inputs
            if (name.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(this, "Please enter a valid email", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Call Supabase signup API
            val supabaseService = SupabaseClient.authService
            val call = supabaseService.signup(AuthRequest(email, password))

            call.enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    if (response.isSuccessful) {
                        // Show success animation
                        successAnim.visibility = View.VISIBLE
                        successAnim.playAnimation()

                        Toast.makeText(
                            this@SignupActivity,
                            "Signup successful! Please check your email to confirm your account before logging in.",
                            Toast.LENGTH_LONG
                        ).show()

                        // Delay to let animation play before switching screen
                        successAnim.postDelayed({
                            startActivity(Intent(this@SignupActivity, MainActivity::class.java))
                            finish()
                        }, 2000) // 2 seconds
                    } else {
                        Toast.makeText(
                            this@SignupActivity,
                            "Signup failed: ${response.errorBody()?.string()}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    Toast.makeText(
                        this@SignupActivity,
                        "Signup error: ${t.localizedMessage}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            })
        }

        loginLink.setOnClickListener {
            finish() // Go back to login screen
        }
    }
}