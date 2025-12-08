package com.example.openticket.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.openticket.entity.Member;




public interface MemberRepository extends JpaRepository<Member, Long>{
    boolean existsByAccount (String account);

    Optional<Member>  findByAccount (String account);

    @Query("SELECT m.role FROM Member m WHERE m.account = :account")
    Integer findRoleByAccount (@Param("account") String account);

    @Query("SELECT m.password FROM Member m WHERE m.account = :account")
    String findPasswordByAccount (String account);
    
}
