package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.CustomPage;
import portfolio.backend.dto.ProjectDetailResponse;
import portfolio.backend.dto.ProjectSimpleResponse;
import portfolio.backend.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;

    @GetMapping("")
    public ApiResponse<CustomPage<ProjectSimpleResponse>> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String category) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending());

        Page<ProjectSimpleResponse> projectPage = projectService.getProjects(pageable, category);

        return ApiResponse.success(CustomPage.from(projectPage));
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> getProjectDetail(@PathVariable Long id) {
        ProjectDetailResponse project = projectService.getProjectDetail(id);
        return ApiResponse.success(project);
    }
} 