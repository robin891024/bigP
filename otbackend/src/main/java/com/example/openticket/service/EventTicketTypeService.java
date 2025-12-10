package com.example.openticket.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.openticket.dto.EventTicketTypeResponse;
import com.example.openticket.entity.EventTicketType;
import com.example.openticket.entity.TicketDiscountConfig;
import com.example.openticket.repository.EventTicketTypeRep;



@Service
public class EventTicketTypeService {
    @Autowired
    private EventTicketTypeRep eventTicketTypeRep;

    //找出所有活動的所有票
    public List<EventTicketTypeResponse> findAll() {

        List<EventTicketType> list = eventTicketTypeRep.findAll();

        return list.stream()
                .map(ett -> {
                    EventTicketTypeResponse dto = new EventTicketTypeResponse();
                    dto.setId(ett.getId());
                    dto.setEventId(ett.getEvent().getId());
                    dto.setTicketType(ett.getTicketType().getName());
                    dto.setTicket_template_id(ett.getTicketType().getId());           
                    dto.setIslimited(ett.getIslimited());
                    dto.setCustomprice(ett.getCustomprice());
                    dto.setCustomlimit(ett.getCustomlimit());
                    dto.setCreatedat(ett.getCreatedat());
                    
                    // dto.setRemark(ett.getTicketType().getRemark());

                    return dto;
                })
                .toList();
    }

    //依活動ID找相對應的票種
    public List<EventTicketTypeResponse> findByEventId(Long eventId) {
        List<EventTicketType> list = eventTicketTypeRep.findByEventId(eventId);

        return list.stream()
                .map(ett -> {
                    EventTicketTypeResponse dto = new EventTicketTypeResponse();
                    dto.setId(ett.getId());
                    dto.setEventId(ett.getEvent().getId());
                    dto.setTicketType(ett.getTicketType().getName());
                    dto.setTicket_template_id(ett.getTicketType().getId());
                    dto.setIslimited(ett.getIslimited());
                    dto.setCustomprice(ett.getCustomprice());
                    dto.setCustomlimit(ett.getCustomlimit());
                    dto.setCreatedat(ett.getCreatedat());
                    dto.setDescription(ett.getTicketType().getDescription());
                    // dto.setRemark(ett.getTicketType().getRemark());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    //測試扣庫存

    /*
    減少指定票種的庫存
    @param eventTicketTypeId EventTicketType的ID (primary key)
    @param quantity減少的數量
    @return true:扣減成功(庫存足夠並更新了1行);false:庫存不足或ID錯誤
    */
    @Transactional
    public boolean decreaseStock(Long eventTicketTypeId, int quantity){
        if (quantity <= 0) {
            throw new IllegalArgumentException("減少數量必須大於0");
        }
        //使用Repository中的原子性更新方法
        // int updateRows = eventTicketTypeRep.decreaseStock(eventTicketTypeId, quantity);
        // return updateRows > 0;

        //查詢票種是否限量
        Boolean isLimited = eventTicketTypeRep.findIsLimitedById(eventTicketTypeId);

        //如果票種id不存在，拋出例外
        if (isLimited == null) {
            throw new RuntimeException("票種ID錯誤或找不到此票種");
        }
        
        //判斷是否為不限量，如果是不限量票，直接視為成功，不執行資料庫庫存更新
        if (isLimited.equals(Boolean.FALSE)) {
            return true;
        }
        //如果是限量票(isLimited = true)，則使用方法執行原子性更新
        int updateRows = eventTicketTypeRep.decreaseLimitedStock(eventTicketTypeId, quantity);
        if (updateRows == 0) {
            throw new RuntimeException("此票種庫存不足");
        }
        
        return true;
    }

    /*
    增加指定票種的庫存(包括訂單取消或回滾)
    @param eventTicketTypeId EventTicketType的 ID (primary key)
    @param quantity增加的數量
    @return true: 增加成功; false: ID 錯誤
    */
    @Transactional
    public boolean increaseStock(Long eventTicketTypeId, int quantity){
        if(quantity <= 0){
            throw new IllegalArgumentException("增加數量必須大於0");
        }
        //使用Repository中的原子性更新方法
        // int updateRows = eventTicketTypeRep.increaseStock(eventTicketTypeId, quantity);
        // return updateRows > 0;

        //查詢票種是否為限量
        Boolean isLimited = eventTicketTypeRep.findIsLimitedById(eventTicketTypeId);
        //不限量票和ID錯誤
        if (isLimited == null) {
        // 如果找不到票種 ID
        System.err.println("警告：嘗試回滾一個不存在的票種ID: " + eventTicketTypeId);
        return false; 
        }

        if (isLimited.equals(Boolean.FALSE)) {
            return true;
        }
        
        // 3. 如果是限量票(isLimited = true)，則使用新的方法執行原子性更新
        int updateRows = eventTicketTypeRep.increaseLimitedStock(eventTicketTypeId, quantity);

        return updateRows > 0;
    }

    
    //早鳥票設置
    private BigDecimal calculateFinalPrice(EventTicketType ett){
        BigDecimal basePrice = ett.getCustomprice();//取得原價
        
        TicketDiscountConfig config = ett.getTicketDiscountConfig();
        if(config == null){//若無設定早鳥，回傳原價
            return basePrice.setScale(2, RoundingMode.HALF_UP);
        }

        //判斷是否在早鳥期間內
        LocalDate event_start = ett.getEvent().getEvent_start();
        LocalDate now = LocalDate.now();

        int durationDays = config.getDuration_days();
        //早鳥結束時間 = 活動開始日期 - 提前天數
        LocalDate earlyBirdStart = event_start.minusDays(durationDays);

        boolean inEarlyBird = now.isAfter(earlyBirdStart) && now.isBefore(event_start);
        
        if(!inEarlyBird){
            return basePrice.setScale(2, RoundingMode.HALF_UP);
        }
        
        //計算折扣後價格
        BigDecimal discountRate = config.getDiscount_rate();//ex: 0.2 => 8折
        BigDecimal multiplier = BigDecimal.ONE.subtract(discountRate);

        BigDecimal finalPrice = basePrice.multiply(multiplier);
        return finalPrice.setScale(2,  RoundingMode.HALF_UP);
    }


    //早鳥票DTO
    private EventTicketTypeResponse mapToDtoWithEarlyBird(EventTicketType ett){
        EventTicketTypeResponse dto = new EventTicketTypeResponse();
        
        dto.setId(ett.getId());
        dto.setEventId(ett.getEvent().getId());
        dto.setTicketType(ett.getTicketType().getName());
        dto.setTicket_template_id(ett.getTicketType().getId());
        dto.setIslimited(ett.getIslimited());
        dto.setCustomprice(ett.getCustomprice());
        dto.setCustomlimit(ett.getCustomlimit());
        dto.setCreatedat(ett.getCreatedat());
        dto.setDescription(ett.getTicketType().getDescription());

        //早鳥票相關資訊
        TicketDiscountConfig config = ett.getTicketDiscountConfig();
        boolean earlyBirdEnabled = (config != null);

        dto.setEarlyBirdEnabled(earlyBirdEnabled);
        dto.setDiscountRate(earlyBirdEnabled ? (
            config.getDiscount_rate() != null ? 
            config.getDiscount_rate() : BigDecimal.ZERO) : BigDecimal.ZERO);
        dto.setFinalPrice(calculateFinalPrice(ett));

        return dto;
        }


}




