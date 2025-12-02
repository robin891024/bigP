package backend.otp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="event")
@Data
public class Event {
    @Id
    private Long id;

    private String title;
    private String description;


    //---------------------------------------

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}