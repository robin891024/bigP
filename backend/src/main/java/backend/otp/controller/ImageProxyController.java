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

import backend.otp.service.SmbStorageService;

@RestController
@RequestMapping("/api/images")
public class ImageProxyController {

    @Autowired
    private SmbStorageService smbStorageService;

    /**
     * 取得活動封面圖片
     * GET /api/images/covers/{filename}
     */
    @GetMapping("/covers/{filename}")
    public ResponseEntity<StreamingResponseBody> getCover(@PathVariable String filename) {
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
