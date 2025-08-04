package portfolio.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import portfolio.backend.entity.Project;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // 카테고리별 페이징
    Page<Project> findByCategory(String category, Pageable pageable);

    List<Project> findByCategory(String category);
    List<Project> findAllByOrderByDisplayOrderAsc();

    // 전체 프로젝트 페이징
    Page<Project> findAll(Pageable pageable);
} 