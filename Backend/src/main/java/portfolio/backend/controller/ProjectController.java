package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.ProjectDetailResponse;
import portfolio.backend.dto.ProjectSimpleResponse;
import portfolio.backend.service.ProjectService;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;

    @GetMapping("")
    public ApiResponse<List<ProjectSimpleResponse>> getProjects(
            @RequestParam(required = false) String category) {
        List<ProjectSimpleResponse> projectPage = projectService.getProjects(category);

        return ApiResponse.success(projectPage);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> getProjectDetail(@PathVariable Long id) {
        ProjectDetailResponse project = projectService.getProjectDetail(id);
        return ApiResponse.success(project);
    }
} 