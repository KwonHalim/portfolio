package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.service.FeedBackService;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedBackController {
    private final FeedBackService feedBackService;
}
