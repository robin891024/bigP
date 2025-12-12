package backend.otp.service;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String SEND_TIME_PREFIX = "verification:send_time:";
    private static final String ATTEMPT_PREFIX = "verification:attempts:";
    private static final String LOCK_PREFIX = "verification:lock:";

    private static final int MAX_ATTEMPTS = 5;
    private static final long SEND_COOLDOWN = 60; // 60秒
    private static final long ATTEMPT_EXPIRE = 300; // 5分鐘
    private static final long LOCK_DURATION = 300; // 鎖定5分鐘

    /**
     * 檢查是否可以發送驗證碼 (60秒冷卻)
     */
    public boolean canSendCode(String email) {
        String key = SEND_TIME_PREFIX + email;
        return !Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 記錄發送時間
     */
    public void recordSendTime(String email) {
        String key = SEND_TIME_PREFIX + email;
        long timestamp = System.currentTimeMillis();
        redisTemplate.opsForValue().set(key, String.valueOf(timestamp), SEND_COOLDOWN, TimeUnit.SECONDS);
    }

    /**
     * 獲取剩餘冷卻時間
     */
    public long getRemainingCooldown(String email) {
        String key = SEND_TIME_PREFIX + email;
        Long expire = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return expire != null ? expire : 0;
    }

    /**
     * 檢查是否被鎖定
     */
    public boolean isLocked(String email) {
        String key = LOCK_PREFIX + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 獲取鎖定剩餘時間(秒)
     */
    public long getLockRemainingTime(String email) {
        String key = LOCK_PREFIX + email;
        Long expire = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return expire != null && expire > 0 ? expire : 0;
    }

    /**
     * 檢查驗證碼嘗試次數
     */
    public boolean canAttempt(String email) {
        // 先檢查是否被鎖定
        if (isLocked(email)) {
            return false;
        }
        
        String key = ATTEMPT_PREFIX + email;
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            return true;
        }
        int attempts = Integer.parseInt(value.toString());
        return attempts < MAX_ATTEMPTS;
    }

    /**
     * 增加嘗試次數
     */
    public int incrementAttempts(String email) {
        String key = ATTEMPT_PREFIX + email;
        Long attempts = redisTemplate.opsForValue().increment(key);
        
        // 設定過期時間 (5分鐘)
        if (attempts == 1) {
            redisTemplate.expire(key, ATTEMPT_EXPIRE, TimeUnit.SECONDS);
        }
        
        // 如果達到最大嘗試次數,設定鎖定
        if (attempts >= MAX_ATTEMPTS) {
            lockAccount(email);
        }
        
        return attempts.intValue();
    }

    /**
     * 鎖定帳號(5分鐘)
     */
    private void lockAccount(String email) {
        String key = LOCK_PREFIX + email;
        redisTemplate.opsForValue().set(key, "locked", LOCK_DURATION, TimeUnit.SECONDS);
    }

    /**
     * 清除嘗試次數和鎖定 (驗證成功後)
     */
    public void clearAttempts(String email) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String lockKey = LOCK_PREFIX + email;
        redisTemplate.delete(attemptKey);
        redisTemplate.delete(lockKey);
    }

    /**
     * 獲取剩餘嘗試次數
     */
    public int getRemainingAttempts(String email) {
        String key = ATTEMPT_PREFIX + email;
        Object value = redisTemplate.opsForValue().get(key);
        int attempts = (value != null) ? Integer.parseInt(value.toString()) : 0;
        return MAX_ATTEMPTS - attempts;
    }

}
