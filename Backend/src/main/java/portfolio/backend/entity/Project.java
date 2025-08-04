package portfolio.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project extends BaseEntity{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String category; //어떤 종류의 프로젝트인지
    
    @Column(columnDefinition = "TEXT")
    private String description; //프로젝트 전체에 대한 설명
    
    @Column
    private String imagePath;

    @Column
    private String githubUrl;
    
    @Column
    private String demoUrl;
    
    @Column
    private Integer displayOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder DESC")
    private List<ProjectImage> images = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_technology", // 연결 테이블
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "technology_id") // Technology 테이블의 ID 참조
    )
    private Set<Technology> technologies = new HashSet<>();
} 