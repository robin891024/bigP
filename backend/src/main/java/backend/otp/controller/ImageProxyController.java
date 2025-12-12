package backend.otp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
