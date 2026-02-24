
import com.example.greentechlogin.AuthRequest
import com.example.greentechlogin.AuthResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST


data class AuthRequest(val email: String, val password: String)

data class UserResponse(val id: String, val email: String?)
data class AuthResponse(val access_token: String?, val user: UserResponse?)

interface SupabaseAuthService {

    @Headers(
        "Content-Type: application/json",
        "apikey:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84",
        "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84"
    )
    @POST("auth/v1/signup")
    fun signup(@Body request: AuthRequest): Call<AuthResponse>

    @Headers(
        "Content-Type: application/json",
        "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84",
        "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84"
    )
    @POST("auth/v1/token?grant_type=password")
    fun login(@Body request: AuthRequest): Call<AuthResponse>

    @Headers(
        "Content-Type: application/json",
        "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84",
        "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aWh6Z3lhZm5sc2htdWJsamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjMzNTQsImV4cCI6MjA2NDA5OTM1NH0.n1r5glscuhAZJR2YLr8s-PzpyOVfkI0Sp5Fi11eIm84"
    )
    @POST("auth/v1/user")
    fun updatePassword(@Body body: Map<String, String>): Call<Void>

}



