package com.example.greentechlogin

import SupabaseClient
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.greentechlogin.databinding.ActivityMainBinding
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inflate layout using ViewBinding
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // ✅ Handle deep link if any
        intent?.data?.let { uri ->
            Log.d("DeepLink", "App opened via deep link: $uri")
        }

        binding.loginBtn.setOnClickListener {
            val email = binding.emailInput.text.toString().trim()
            val password = binding.passwordInput.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                showToast("Please fill all fields")
                return@setOnClickListener
            }

            loginUser(email, password)
        }

        binding.signupLink.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            startActivity(intent)
        }
    }

    private fun loginUser(email: String, password: String) {
        binding.progressBar.visibility = View.VISIBLE

        val call = SupabaseClient.authService.login(AuthRequest(email, password))
        call.enqueue(object : Callback<AuthResponse> {
            override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                binding.progressBar.visibility = View.GONE

                if (response.isSuccessful) {
                    val token = response.body()?.access_token
                    token?.let {
                        saveToken(it)
                    }
                    showToast("Login successful!")
                    startActivity(Intent(this@MainActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    showToast("Login failed: ${response.errorBody()?.string()}")
                }
            }

            override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                binding.progressBar.visibility = View.GONE
                showToast("Login error: ${t.localizedMessage}")
            }
        })
    }

    private fun saveToken(token: String) {
        val prefs = getSharedPreferences("user_prefs", MODE_PRIVATE)
        prefs.edit().putString("access_token", token).apply()
    }

    private fun showToast(message: String) {
        Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
    }
}
