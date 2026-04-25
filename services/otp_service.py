import random
import logging

class OTPService:
    def __init__(self):
        # In a production app, you would initialize your Twilio/2Factor client here
        # self.api_key = "YOUR_API_KEY"
        pass

    def send_otp(self, mobile: str) -> str:
        """
        Simulates sending an OTP to an Indian mobile number via an Open API structure.
        For hackathon purposes, we generate a real code and log it.
        """
        otp_code = str(random.randint(100000, 999999))
        
        # SIMULATION: In a real app, you would do:
        # requests.post(f"https://api.sms-provider.com/send?number={mobile}&code={otp_code}")
        
        logging.info(f" [SMS GATEWAY] Sending OTP {otp_code} to +91-{mobile}")
        
        # We return the code so the backend can verify it, 
        # or in a real system, we'd store it in a cache (like Redis).
        return otp_code
