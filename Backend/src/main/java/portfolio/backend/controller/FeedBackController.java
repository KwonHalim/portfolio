package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.FeedBackRequest;
import portfolio.backend.entity.Feedback;
import portfolio.backend.exception.ErrorStatus;
import portfolio.backend.service.FeedBackService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedBackController {
    private final FeedBackService feedBackService;

    @PostMapping("/feedback")
    public ApiResponse<String> handleFeedback(@RequestBody FeedBackRequest feedBackRequest) {
        try {
            Feedback result = feedBackService.saveFeedBack(
                    feedBackRequest.getFeedback(),
                    feedBackRequest.getSession()
            );
            return ApiResponse.success("feedback saved successfully");
        }
        catch (Exception e) {
            return ApiResponse.error(ErrorStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
