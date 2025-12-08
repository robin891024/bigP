package backend.otp.service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.otp.dto.ReservationItemsCreateRequest;
import backend.otp.dto.ReservationItemsResponse;
import backend.otp.dto.ReservationResponse;
import backend.otp.dto.ReservationsCreateRequest;
import backend.otp.entity.EventJpa;
import backend.otp.entity.EventTicketType;
import backend.otp.entity.Member;
import backend.otp.entity.ReservationItems;
import backend.otp.entity.Reservations;
import backend.otp.repository.EventRepositoryJPA;
import backend.otp.repository.EventTicketTypeRep;
import backend.otp.repository.MemberRepository;
import backend.otp.repository.ReservationsRepository;


@Service
public class ReservationsService {
    @Autowired
    private ReservationsRepository repositoryrepo;
    @Autowired
    private EventTicketTypeRep eventTicketTypeRep;
    @Autowired
    private EventRepositoryJPA eventRepositoryJPA;
    @Autowired
    private MemberRepository memberRepository;



    //建立Reservations
    @Transactional
    public Reservations createReservation(ReservationsCreateRequest request){
        // Reservations reservations = new Reservations();
        //查詢會員(會員先寫死)
        Member user = memberRepository.findById(3L) //request.getUserId()
        .orElseThrow(() -> new RuntimeException("找不到會員 ID: 3L"));

        //查詢活動
        EventJpa event = eventRepositoryJPA.findById(request.getEventId())
        .orElseThrow(() -> new RuntimeException("活動不存在" + request.getEventId()));
        
        //所有票種總價
        BigDecimal calculatedTotalAmount = BigDecimal.ZERO;

        //設定時間和狀態
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(2);//設定兩分鐘過期

        //整合Reservations的Entity並設定屬性

        Reservations reservation = new Reservations();
        reservation.setUser(user);
        reservation.setEvent(event);
        // reservation.setEventTicketType(ticketType);
        // reservation.setQuantity(quantity);
        // reservation.setTotalTicketPrice(singleTicketTypeTotalPrice);
        // reservation.setTotalAmount(totalAmount);
        // reservation.setStatus("PENDING");
        reservation.setCreatedAt(now);
        reservation.setExpiresAt(expiresAt);

        //處理所有預定單細項
        for(ReservationItemsCreateRequest reservationItemsCreateRequest : request.getItems()){

            EventTicketType ticketType = eventTicketTypeRep.findById(reservationItemsCreateRequest.getEventTicketTypeId())
                    .orElseThrow(() -> new RuntimeException("票種不存在" + reservationItemsCreateRequest.getEventTicketTypeId()));

            //計算單一票種價格
            BigDecimal itemUnitPrice = ticketType.getCustomprice();
            int itemQuantity = reservationItemsCreateRequest.getQuantity();
            BigDecimal itemSubtotal = itemUnitPrice.multiply(new BigDecimal(itemQuantity));
        
            //所有票種總和
            calculatedTotalAmount = calculatedTotalAmount.add(itemSubtotal);

            //建立ReservationItem 實體
            ReservationItems item = new ReservationItems(); // *** 需要確保 ReservationItem Entity 已建立並導入 ***
            item.setEventTicketType(ticketType);
            item.setQuantity(itemQuantity);
            item.setUnitPrice(itemUnitPrice); // 儲存當前單價
            // item.setSubtotalPrice(itemSubtotal);
            reservation.addItem(item);

        }
        reservation.setTotalAmount(calculatedTotalAmount);
        Reservations savedReservation = repositoryrepo.save(reservation);
        return savedReservation;
    }


    private ReservationResponse mapToReservationResponse(Reservations entity) {
        ReservationResponse response = new ReservationResponse();
        
        response.setId(entity.getId());
        response.setUserId(entity.getUser().getId());
        response.setEventId(entity.getEvent().getId());
        // response.setStatus(entity.getStatus());
        response.setExpiresAt(entity.getExpiresAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setTotalAmount(entity.getTotalAmount());

        List<ReservationItemsResponse> itemResponses = entity.getItems().stream()
            .map(this::mapToReservationItemsResponse) // 使用新的輔助方法轉換每個細項
            .toList();
        response.setItems(itemResponses);
        
        return response;
    }

    private ReservationItemsResponse mapToReservationItemsResponse(ReservationItems itemEntity) {
        ReservationItemsResponse response = new ReservationItemsResponse();
    
        response.setId(itemEntity.getId());
        // 假設您的 DTO 包含以下欄位
        response.setEventTicketTypeId(itemEntity.getEventTicketType().getId()); 
        response.setQuantity(itemEntity.getQuantity());
        response.setUnitPrice(itemEntity.getUnitPrice());
    
        return response;
    }

}


//無法一次紀錄兩種不同的票種
//狀態改變PENDING