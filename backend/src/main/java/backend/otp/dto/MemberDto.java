package backend.otp.dto;

import lombok.Data;

@Data
public class MemberDto {
    private Long id;
    private String account;
    private String name;
    private Integer role;
    private String city;
    private String tel;
}
