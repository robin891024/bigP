package backend.otp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.otp.entity.LoginLog;

public interface  LoginLogRepository extends JpaRepository<LoginLog, Long>{

}
