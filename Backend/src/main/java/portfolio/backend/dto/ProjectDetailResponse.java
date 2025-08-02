package portfolio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import portfolio.backend.entity.Project;
import portfolio.backend.entity.ProjectImage;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailResponse {
    
    private Long id;
    private String title;
    private String category;
    private String description;
    private List<String> imagePath;
    private String githubUrl;
    private String demoUrl;
    private Integer displayOrder;
    private List<String> technologies;

    public static ProjectDetailResponse from(Project project) {
        return ProjectDetailResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .category(project.getCategory())
                .description(project.getDescription())
                .imagePath(project.getImages().stream()
                        .map(projectImage -> projectImage.getImagePath())
                        .collect(Collectors.toList()))
                .githubUrl(project.getGithubUrl())
                .demoUrl(project.getDemoUrl())
                .displayOrder(project.getDisplayOrder())
                .technologies(project.getTechnologies().stream()
                        .map(tech -> tech.getName())
                        .collect(Collectors.toList()))
                .build();
    }
}
