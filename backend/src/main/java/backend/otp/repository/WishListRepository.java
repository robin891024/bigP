package backend.otp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import backend.otp.entity.WishList;

public interface  WishListRepository extends JpaRepository<WishList, Long>{

    @Query("""
        SELECT w
        FROM WishList w
        JOIN FETCH w.event e
        JOIN FETCH e.organizer o
        WHERE w.member.id = :userid
    """)
    List<WishList> findEvent_idByUser_id (Long userid);

    boolean existsByMember_IdAndEvent_Id(Long memberId, Long eventId);

    void deleteByMember_IdAndEvent_Id(Long memberId, Long eventId);

}
