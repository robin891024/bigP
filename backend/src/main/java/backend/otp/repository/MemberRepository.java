package backend.otp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.otp.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long>{
    boolean existsByAccount (String account);

    Optional<Member>  findByAccount (String account);
}
