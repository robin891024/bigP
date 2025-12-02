package backend.otp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MemberReviseDto {
    private String password;
    private String name;
    private String city;
    private String tel; 
}
