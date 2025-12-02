package backend.otp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import backend.otp.entity.Member;
import backend.otp.repository.MemberRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner init (MemberRepository repo, PasswordEncoder encoder) {
		
		CommandLineRunner cmd = new CommandLineRunner() {
			
			@Override
			public void run (String... args) throws Exception {

				if (repo.findByAccount("developer").isEmpty()) {
					Member member = new Member();
					member.setAccount("developer");
					member.setPassword(encoder.encode("123456"));
					member.setName("開發者");
					member.setRole(0);
					member.setCity("");
					repo.save(member);
				}

				if (repo.findByAccount("admin").isEmpty()) {
					Member member = new Member();
					member.setAccount("admin");
					member.setPassword(encoder.encode("123456"));
					member.setName("管理員");
					member.setRole(1);
					member.setCity("");
					repo.save(member);
				}
			}

		};

		return cmd;
	}

}
