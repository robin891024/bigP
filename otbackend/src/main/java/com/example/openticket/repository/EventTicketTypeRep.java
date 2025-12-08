package com.example.openticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.openticket.entity.EventTicketType;

// import tw.jay.springtest.entity.EventTicketType;

public interface EventTicketTypeRep extends JpaRepository<EventTicketType, Long> {
    // 依 event_id 查詢
    List<EventTicketType> findByEventId(Long eventId);
    // 依 TicketType 查詢
    List<EventTicketType> findByTicketTypeId(Long ticketTypeId);

    // 庫存操作

    //減少庫存
    // @Modifying
    // @Transactional
    // @Query("UPDATE EventTicketType ett SET ett.customlimit = ett.customlimit - :quantity WHERE ett.id = :id AND ett.customlimit >= :quantity")
    // int decreaseStock(Long id, int quantity);//這是一個樂觀鎖的變體，只有當`customlimit >= :quantity`時才會執行更新

    // 僅針對限量票進行庫存回滾，不限量不回滾?
    @Modifying
    @Transactional
    @Query("UPDATE EventTicketType ett SET ett.customlimit = ett.customlimit + :quantity " +
           "WHERE ett.id = :id AND ett.islimited = true")
    int increaseLimitedStock(@Param("id") Long id, @Param("quantity") int quantity);
    
    //增加庫存
    @Modifying
    @Transactional
    @Query("UPDATE EventTicketType ett SET ett.customlimit = ett.customlimit + :quantity WHERE ett.id = :id")
    int increaseStock(Long id, int quantity);

    //確認票是否為限量(islimited欄位是布林 0=不限量，1限量)
    @Query("SELECT ett.islimited FROM EventTicketType ett WHERE ett.id = :id")
    Boolean findIsLimitedById(@Param("id") Long id);

    //針對限量票進行扣庫存
    @Modifying
    @Transactional
    @Query("UPDATE EventTicketType ett SET ett.customlimit = ett.customlimit - :quantity " +
           "WHERE ett.id = :id AND ett.islimited = true AND ett.customlimit >= :quantity")
    int decreaseLimitedStock(@Param("id") Long id, @Param("quantity") int quantity);


    // 查詢某活動的所有早鳥票
       @Query("select ett from EventTicketType ett " +
              "left join fetch ett.ticketDiscountConfig tdc " +
              "left join fetch ett.event e " +
              "where ett.id = :id")
       Optional<EventTicketType> findByIdWithDiscountAndEvent(@Param("id") Long id);
}