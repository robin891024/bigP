package backend.otp.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ShowWishListDto {

    private Long eventId;
    private String eventName;
    private String organizerName;  // 改為 organizerName，更符合新的資料結構
    private String status;
    private String organizerTel;   // 改為 organizerTel

    private LocalDate eventStartDate;
    private LocalDate eventEndDate;

    private String eventAddress;
}
