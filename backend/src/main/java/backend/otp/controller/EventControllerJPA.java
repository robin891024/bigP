package backend.otp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.otp.entity.EventJpa;
import backend.otp.service.EventService;



@RestController
@RequestMapping("/api/events")
public class EventControllerJPA {

    @Autowired
    private EventService eventsService;

    @GetMapping("/all")
    public List<EventJpa> getallEvents(){
        return eventsService.getallEvent();
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        return eventsService.getEventById(id)
                .map(event -> {//如果有找到event就做下面的事 
                    // 回傳 JSON 給前端
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", event.getId());
                    response.put("title", event.getTitle());
                    // response.put("detail", event.getDetail());
                    response.put("event_start", event.getEvent_start());
                    response.put("event_end", event.getEvent_end());
                    response.put("address", event.getAddress());

                    return ResponseEntity.ok(response);// 如果有找到event就回傳200和event
                })

                .orElse(ResponseEntity.notFound().build());// 如果沒有就回傳404

    }

    //DTO版本
    // @GetMapping("/{id}")
    // public ResponseEntity<Event> getEvent(@PathVariable Long id) {
    //     return eventsService.getEventById(id)
    //             .map(event -> {
    //                 Event dto = new Event();
    //                 dto.setId(event.getId());
    //                 dto.setTitle(event.getTitle());
    //                 dto.setAddress(event.getAddress());
    //                 dto.setEvent_start(event.getEvent_start());
    //                 dto.setEvent_end(event.getEvent_end());
    //                 // 根據需要設置其他屬性
    //                 return ResponseEntity.ok(dto);
    //             })
    //             .orElse(ResponseEntity.notFound().build());
    // }
}