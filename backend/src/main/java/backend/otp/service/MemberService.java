package backend.otp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.entity.Member;
import backend.otp.repository.MemberRepository;
import backend.otp.utils.BCrypt;

@Service
public class MemberService {

    @Autowired
    private MemberRepository repository;

    public boolean checkAc(String account) {
        return repository.existsByAccount(account);
    }

    public boolean register(Member member) {
        if (repository.existsByAccount(member.getAccount())) {
            return false;
        }

        member.setPassword(BCrypt.hashpw(member.getPassword(), BCrypt.gensalt()));
        member.setRole(2);
        Member saveMember = repository.save(member);

        return saveMember != null;
    }

    public boolean login(String account, String password) {
        Member member = repository.findByAccount(account).orElse(null);
        return member != null && BCrypt.checkpw(password, member.getPassword());
    }

    public Member findByAccount(String account) {
        return repository.findByAccount(account).orElse(null);
    }

    public Integer findRoleByAccount (String account) {
        return repository.findRoleByAccount(account);
    }

    

}
