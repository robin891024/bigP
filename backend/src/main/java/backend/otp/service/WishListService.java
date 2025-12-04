package backend.otp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.otp.entity.Event;
import backend.otp.entity.Member;
import backend.otp.entity.WishList;
import backend.otp.repository.WishListRepository;
import jakarta.transaction.Transactional;

@Service
public class WishListService {

    @Autowired
    private WishListRepository repository;

    @Transactional
    public boolean addWishList(Long memberId, Long eventId) {
        if (repository.existsByMember_IdAndEvent_Id(memberId, eventId)) {
            return false;
        }
        try {
            WishList wishList = new WishList();

            Member member = new Member();
            member.setId(memberId);

            Event event = new Event();
            event.setId(eventId);

            wishList.setMember(member);
            wishList.setEvent(event);

            repository.save(wishList);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean deleteWishList(Long memberId, Long eventId) {
        if (repository.existsByMember_IdAndEvent_Id(memberId, eventId)) {
            repository.deleteByMember_IdAndEvent_Id(memberId, eventId);
            return true;
        }
        return false;
    }

    public enum WishAction {
        ADDED, REMOVED
    }

    public WishAction toggleWish(Long memberId, Long eventId) {
        if (repository.existsByMember_IdAndEvent_Id(memberId, eventId)) {
            repository.deleteByMember_IdAndEvent_Id(memberId, eventId);
            return WishAction.REMOVED;
        } else {
            WishList wishList = new WishList();

            Member member = new Member();
            member.setId(memberId);

            Event event = new Event();
            event.setId(eventId);

            wishList.setMember(member);
            wishList.setEvent(event);

            repository.save(wishList);

            return WishAction.ADDED;
        }
    }

    public List<WishList> getWishListByUserId(Long userId) {
        return repository.findEvent_idByUser_id(userId);
    }
}
