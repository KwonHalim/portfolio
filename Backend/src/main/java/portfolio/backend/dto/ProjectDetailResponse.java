package portfolio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import portfolio.backend.entity.Project;
import portfolio.backend.entity.ProjectImage;
import portfolio.backend.entity.Technology;

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
    private String githubUrl;
    private String demoUrl;
    private Integer displayOrder;
    private List<String> technologies;
    private List<ImageInfo> images;
    private String description;

    @Getter
    @Builder
    public static class ImageInfo {
        private String imagePath;
        private String description; // 각 이미지에 대한 설명
    }


    public static ProjectDetailResponse from(Project project) {
        return ProjectDetailResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .category(project.getCategory())
                .githubUrl(project.getGithubUrl())
                .demoUrl(project.getDemoUrl())
                .displayOrder(project.getDisplayOrder())
                .description(project.getDescription())
                .technologies(project.getTechnologies().stream()
                        .map(Technology::getName)
                        .collect(Collectors.toList()))
                .images(project.getImages().stream()
                        .map(image -> ImageInfo.builder()
                                .imagePath(image.getImagePath())
                                .description(image.getDescription())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}