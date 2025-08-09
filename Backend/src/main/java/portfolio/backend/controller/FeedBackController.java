package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.FeedBackRequest;
import portfolio.backend.exception.ErrorStatus;
import portfolio.backend.service.FeedBackService;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedBackController {
    private final FeedBackService feedBackService;

    @PostMapping
    public ApiResponse<String> feedback(@RequestBody FeedBackRequest feedBackRequest) {
        Boolean b = feedBackService.saveFeedBack(feedBackRequest.getFeedback(), feedBackRequest.getSession());
        if (b) {
            return ApiResponse.success("feedback saved successfully");
        }
        else {
            return ApiResponse.error(ErrorStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
