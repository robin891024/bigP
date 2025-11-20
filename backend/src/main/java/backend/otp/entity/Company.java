package backend.otp.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="company_profile")
@Data
public class Company {
    @Id
    private Long id;
    private String company_name;
    private String tel;

    // ------------------------------

    @OneToMany(
        mappedBy="company",
        cascade=CascadeType.ALL
    )
    private List<Event> event;
}
