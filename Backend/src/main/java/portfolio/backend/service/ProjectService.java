package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import portfolio.backend.dto.ProjectDetailResponse;
import portfolio.backend.dto.ProjectSimpleResponse;
import portfolio.backend.entity.Project;
import portfolio.backend.repository.ProjectRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    public Page<ProjectSimpleResponse> getProjects(Pageable pageable, String category) {

        Page<Project> projects;

        if (category != null && !category.equals("all")) {
            projects = projectRepository.findByCategory(category, pageable);
        } else {
            projects = projectRepository.findAll(pageable);
        }

        return projects.map(project -> portfolio.backend.dto.ProjectSimpleResponse.from(project));
    }

    public ProjectDetailResponse getProjectDetail(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
        return ProjectDetailResponse.from(project);
    }
}