package portfolio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import portfolio.backend.entity.Technology;

@Repository
public interface TechnologyRepository extends JpaRepository<Technology, Long> {
}
