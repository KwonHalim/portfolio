package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.TimelineResponse;
import portfolio.backend.service.TimelineService;

@RestController
@RequestMapping("/api/tech-stacks")
@RequiredArgsConstructor
public class TimelineController {
    private final TimelineService timelineService;

    @GetMapping("/KwonHalim")
    public ApiResponse<TimelineResponse> timeline_page() {
        TimelineResponse timelineResponse = timelineService.timeLinePage();
        return ApiResponse.success(timelineResponse);
    }

} 