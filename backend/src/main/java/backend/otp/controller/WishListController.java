package backend.otp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.dto.ShowWishListDto;
import backend.otp.dto.WishListDto;
import backend.otp.entity.WishList;
import backend.otp.service.WishListService;
import backend.otp.service.WishListService.WishAction;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/wishList")
public class WishListController {

    @Autowired
    private WishListService service;

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> addWishList(@RequestBody WishListDto wishList, HttpServletRequest request) {

        Map<String, Object> res = new HashMap<>();

        try {
            WishAction action = service.toggleWish(
                    wishList.getMemberId(),
                    wishList.getEventId()
            );

            res.put("success", true);

            if (action == WishAction.ADDED) {
                res.put("message", "成功加入最愛！");
            } else {
                res.put("message", "成功刪除最愛！");
            }

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "錯誤，請稍後再試");
        }

        return ResponseEntity.ok(res);
    }

    @GetMapping("/get")
    @PreAuthorize("hasRole('USER')")
    public List<ShowWishListDto> getWishList(@RequestParam Long userId) {

        List<WishList> wishList = service.getWishListByUserId(userId);

        return wishList.stream().map(w -> {
            ShowWishListDto dto = new ShowWishListDto();
            dto.setEventId(w.getEvent().getId());
            dto.setEventName(w.getEvent().getTitle());
            dto.setOrganizerName(w.getEvent().getOrganizer().getName());  // 改為從 Member 取得 name
            dto.setOrganizerTel(w.getEvent().getOrganizer().getTel());    // 改為從 Member 取得 tel

            dto.setEventStartDate(w.getEvent().getEventStartDate());
            dto.setEventEndDate(w.getEvent().getEventEndDate());

            dto.setEventAddress(w.getEvent().getAddress());
            

            // 套用狀態 ID → 中文
            dto.setStatus(toStateName(w.getEvent().getStatus_id()));

            return dto;
        }).toList();
    }

    private String toStateName(Long stateId) {
        return switch (stateId.intValue()) {
            case 1 ->
                "未開放";
            case 2 ->
                "活動進行中";
            case 3 ->
                "已結束";
            case 4 ->
                "開放購票";
            case 5 ->
                "已取消";
            default ->
                "未知狀態";
        };
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> deleteWishList(@RequestBody WishListDto wishList, HttpServletRequest request) {
        Map<String, Object> res = new HashMap<>();

        boolean success = service.deleteWishList(wishList.getMemberId(), wishList.getEventId());

        res.put("success", success);
        res.put("message", success ? "成功刪除" : "刪除失敗");
        return ResponseEntity.ok(res);
    }

}
