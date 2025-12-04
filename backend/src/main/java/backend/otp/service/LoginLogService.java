package backend.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.entity.LoginLog;
import backend.otp.repository.LoginLogRepository;

@Service
public class LoginLogService {

    @Autowired
    private LoginLogRepository repository;

    public boolean saveLoginLog (LoginLog log) {

        repository.save(log);

        return true;
    }
}
