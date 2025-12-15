package backend.otp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import backend.otp.service.SmbStorageService;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Image Proxy API", description = "圖片代理 API，提供活動封面等圖片串流存取功能")
public class ImageProxyController {

    @Autowired
    private SmbStorageService smbStorageService;

    /**
     * 取得活動封面圖片
     * GET /api/images/covers/{filename}
     */
        @Operation(summary = "取得活動封面圖片", description = "依檔名取得活動封面圖片，支援 SMB 串流存取")
        @GetMapping("/covers/{filename}")
        public ResponseEntity<StreamingResponseBody> getCover(
            @Parameter(description = "圖片檔名", required = true) @PathVariable String filename) {
        try {
            StreamingResponseBody body = outputStream -> 
                smbStorageService.streamCover(filename, outputStream);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setCacheControl("max-age=3600, public");

            return new ResponseEntity<>(body, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            // 若找不到圖片或發生錯誤，回傳預設測試圖片
            try {
                StreamingResponseBody fallbackBody = outputStream -> 
                    smbStorageService.streamCover("test.jpg", outputStream);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setCacheControl("max-age=3600, public");
                
                return new ResponseEntity<>(fallbackBody, headers, HttpStatus.OK);
            } catch (Exception ex) {
                // 連測試圖片都找不到，才回傳 404
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        }
    }
}
