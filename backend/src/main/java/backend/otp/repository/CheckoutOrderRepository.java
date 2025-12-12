package backend.otp.repository;
import backend.otp.entity.CheckoutOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CheckoutOrderRepository extends JpaRepository<CheckoutOrder, Long> {}