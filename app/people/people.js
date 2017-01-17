(function (angular) {
	'use strict';

	angular.module('es.people', [
    'es.filters'
  ])

//--  People --------------------------------------------------------------------------------------------------------------------------------------------

    .directive('peopleMenu',[function () {
        return {
            restrict: 'A',
            replace: false,
            templateUrl: 'app/people/people.menu.html',
            link: function (scope, element) {
                
                var searchBox = $(element).find('input');
                
                $(element).parent().hover(
                    function () {
                        searchBox.focus();
                    },
                    function () {
                        searchBox.blur();
                    }
                )
            },
            controller: ['$scope', 'PeopleFactory', function ($scope, PeopleFactory) {
        
                PeopleFactory.getPeople().then(function (data) {
                    $scope.people = data;
                })

            }]
        };
    }])

    .directive('peopleCard',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/people/people.card.html',
            scope: {
                person: '='
            },
            controller: ['$scope', 'PeopleFactory', function ($scope, PeopleFactory) {
                
                PeopleFactory.getPeople().then(function (data) {
                    $scope.people = data;
                })

                $scope.getAvatar = function () {
                    return {
                        'background-image': 'url('+$scope.person.image+')'
                    };
                }
            }]
        };
    }])

    .filter('peopleMenuFilter', function () {
        return function (input, filterText) {
            
            if (typeof filterText !== 'string' || filterText.length === 0) return input;

            var filterArr = filterText.toLowerCase().split(' ');

            var output = [];

            var findMatch = function (haystack, needle) {
                var index = haystack.toLowerCase().indexOf(needle);

                switch (index) {
                    case 0:
                        return 3;
                    case -1:
                        return 1;
                    default:
                        return 2;
                }
            };

            angular.forEach(input, function(value, key) {
                
                var mod = 1;

                for (var i in filterArr) {
                    var m = 1;
                    
                    m = m * findMatch(value.fname, filterArr[i]);
                    m = m * findMatch(value.lname, filterArr[i]);
                    m = m * findMatch(value.job, filterArr[i]);

                    m = m  - 1;

                    mod = mod * m;
                }

                value.score = mod;
                
                if (mod > 0) this.push(value);    

            }, output);
            
            return output;
        }
    })

    .filter('peoplePhoneNumber', function () {
        return function (input) {
            
            if (input.indexOf('020') !== 0) {
                return input.substr(0,3) + ' ' + input.substr(3,4) + ' ' + input.substr(7);
            }
            else {
                return input.substr(0,5) + ' ' + input.substr(5,3) + ' ' + input.substr(8);
            }
        }
    })

    .factory('PeopleFactory', ['$q', '$filter', function ($q, $filter) {
    
        var people = [
          {lname: 'Adams',fname: 'Grace',job: 'Data Analyst',tel: '01276215105',ext: '35105', image: 'img/users/001.jpg'},
          {lname: 'Alexander',fname: 'Carol',job: 'Customer Claims Advisor',tel: '01276215044',ext: '35044', image: 'img/users/002.jpg'},
          {lname: 'Armstrong',fname: 'Alexandra',job: 'Junior Java Developer',tel: '0127621001 ',ext: '35001 ', image: 'img/users/003.jpg'},
          {lname: 'Armstrong',fname: 'Brendan',job: 'Head of Finance',tel: '01276215025',ext: '35025', image: 'img/users/004.jpg'},
          {lname: 'Armstrong',fname: 'Florence',job: 'Marketing Analyst',tel: '01276215098',ext: '35098', image: 'img/users/005.jpg'},
          {lname: 'Arnold',fname: 'Diane',job: 'Oracle Developer',tel: '01276215066',ext: '35066', image: 'img/users/006.jpg'},
          {lname: 'Bailey',fname: 'Micheal',job: 'Marketing Analyst',tel: '01276215198',ext: '35198', image: 'img/users/007.jpg'},
          {lname: 'Baker',fname: 'Emma',job: 'Junior Oracle Developer',tel: '01276215081',ext: '35081', image: 'img/users/008.jpg'},
          {lname: 'Banks',fname: 'Ed',job: 'Assistant Home Underwriter',tel: '01276215082',ext: '35082', image: 'img/users/009.jpg'},
          {lname: 'Banks',fname: 'Mario',job: 'Senior Java Developer',tel: '01276215199',ext: '35199', image: 'img/users/010.jpg'},
          {lname: 'Banks',fname: 'Shaun',job: 'Claims Manager',tel: '01276215243',ext: '35243', image: 'img/users/011.jpg'},
          {lname: 'Barnett',fname: 'Bruce',job: 'Claims Manager',tel: '01276215026',ext: '35026', image: 'img/users/012.jpg'},
          {lname: 'Bennett',fname: 'Lucy',job: 'Customer Support Agent',tel: '01276215178',ext: '35178', image: 'img/users/013.jpg'},
          {lname: 'Berry',fname: 'Eliza',job: 'Business Analyst',tel: '01276215083',ext: '35083', image: 'img/users/014.jpg'},
          {lname: 'Bosgoed',fname: 'Tijs',job: 'Customer Claims Advisor',tel: '01276215260',ext: '35260', image: 'img/users/015.jpg'},
          {lname: 'Bowman',fname: 'Bradley',job: 'Customer Support Agent',tel: '01276215027',ext: '35027', image: 'img/users/016.jpg'},
          {lname: 'Boxem',fname: 'Rebecca',job: 'SAS Developer',tel: '01276215227',ext: '35227', image: 'img/users/017.jpg'},
          {lname: 'Boyd',fname: 'Ken',job: 'Senior Oracle Developer',tel: '01276215157',ext: '35157', image: 'img/users/018.jpg'},
          {lname: 'Bradley',fname: 'Jeremiah',job: 'Home Underwriter',tel: '01276215124',ext: '35124', image: 'img/users/019.jpg'},
          {lname: 'Burke',fname: 'Danielle',job: 'Business Analyst',tel: '01276215067',ext: '35067', image: 'img/users/020.jpg'},
          {lname: 'Burke',fname: 'Olivia',job: 'Trainee Web Designer',tel: '01276215223',ext: '35223', image: 'img/users/021.jpg'},
          {lname: 'Burke',fname: 'Warren',job: 'Junior SAS Developer',tel: '01276215283',ext: '35283', image: 'img/users/022.jpg'},
          {lname: 'Burns',fname: 'Bradley',job: 'Senior Oracle Developer',tel: '01276215028',ext: '35028', image: 'img/users/023.jpg'},
          {lname: 'Burton',fname: 'Albert',job: 'Assistant Motor Underwriter',tel: '01276215002',ext: '35002', image: 'img/users/024.jpg'},
          {lname: 'Butler',fname: 'Caroline',job: 'Web Developer',tel: '01276215045',ext: '35045', image: 'img/users/025.jpg'},
          {lname: 'Butler',fname: 'Gabe',job: 'Senior CMS Developer',tel: '01276215106',ext: '35106', image: 'img/users/026.jpg'},
          {lname: 'Byrd',fname: 'Julia',job: 'Motor Underwriter',tel: '01276215125',ext: '35125', image: 'img/users/027.jpg'},
          {lname: 'Byrd',fname: 'Roberto',job: 'Senior Corporate Analyst',tel: '01276215228',ext: '35228', image: 'img/users/028.jpg'},
          {lname: 'Caldwell',fname: 'Connor',job: 'Junior Oracle Developer',tel: '01276215046',ext: '35046', image: 'img/users/029.jpg'},
          {lname: 'Carr',fname: 'Ellen',job: 'Java Developer',tel: '01276215084',ext: '35084', image: 'img/users/030.jpg'},
          {lname: 'Carr',fname: 'Ross',job: 'Junior Corporate Analyst',tel: '01276215229',ext: '35229', image: 'img/users/031.jpg'},
          {lname: 'Carrasco',fname: 'Ernesto',job: 'Trainee Database Administrator',tel: '01276215085',ext: '35085', image: 'img/users/032.jpg'},
          {lname: 'Carroll',fname: 'Bob',job: 'Junior SAS Developer',tel: '01276215029',ext: '35029', image: 'img/users/033.jpg'},
          {lname: 'Carroll',fname: 'Lily',job: 'Senior SAS Developer',tel: '01276215179',ext: '35179', image: 'img/users/034.jpg'},
          {lname: 'Carter',fname: 'Terrence',job: 'Senior SAS Developer',tel: '01276215261',ext: '35261', image: 'img/users/035.jpg'},
          {lname: 'Castillo',fname: 'Cody',job: 'Junior Corporate Analyst',tel: '01276215047',ext: '35047', image: 'img/users/036.jpg'},
          {lname: 'Chevalier',fname: 'Axelle',job: 'Customer Claims Advisor',tel: '01276215003',ext: '35003', image: 'img/users/037.jpg'},
          {lname: 'Clarke',fname: 'Ernest',job: 'CMS Developer',tel: '01276215086',ext: '35086', image: 'img/users/038.jpg'},
          {lname: 'Clarke',fname: 'Jessica',job: 'Assistant Home Underwriter',tel: '01276215126',ext: '35126', image: 'img/users/039.jpg'},
          {lname: 'Clement',fname: 'Cléo',job: 'Senior Web Designer',tel: '01276215048',ext: '35048', image: 'img/users/040.jpg'},
          {lname: 'Collins',fname: 'Leta',job: 'Corporate Analyst',tel: '01276215180',ext: '35180', image: 'img/users/041.jpg'},
          {lname: 'Cook',fname: 'Willie',job: 'Claims Handler',tel: '01276215284',ext: '35284', image: 'img/users/042.jpg'},
          {lname: 'Crawford',fname: 'Benjamin',job: 'Claims Handler',tel: '01276215030',ext: '35030', image: 'img/users/043.jpg'},
          {lname: 'Crawford',fname: 'Tammy',job: 'Customer Support Agent',tel: '01276215262',ext: '35262', image: 'img/users/044.jpg'},
          {lname: 'Cruz',fname: 'Lance',job: 'Project Manager',tel: '01276215181',ext: '35181', image: 'img/users/045.jpg'},
          {lname: 'Cruz',fname: 'Molly',job: 'Java Developer',tel: '01276215200',ext: '35200', image: 'img/users/046.jpg'},
          {lname: 'Curtis',fname: 'Tammy',job: 'Claims Handler',tel: '01276215263',ext: '35263', image: 'img/users/047.jpg'},
          {lname: 'Curtis',fname: 'Vicki',job: 'Customer Support Agent',tel: '01276215278',ext: '35278', image: 'img/users/048.jpg'},
          {lname: 'Davies',fname: 'Lewis',job: 'Claims Manager',tel: '01276215182',ext: '35182', image: 'img/users/049.jpg'},
          {lname: 'Davis',fname: 'Allie',job: 'Customer Claims Advisor',tel: '01276215004',ext: '35004', image: 'img/users/050.jpg'},
          {lname: 'Davis',fname: 'Suzy',job: 'Junior SAS Developer',tel: '01276215244',ext: '35244', image: 'img/users/051.jpg'},
          {lname: 'Diez',fname: 'Nerea',job: 'Junior Oracle Developer',tel: '01276215218',ext: '35218', image: 'img/users/052.jpg'},
          {lname: 'Diez',fname: 'Santiago',job: 'Project Manager',tel: '01276215245',ext: '35245', image: 'img/users/053.jpg'},
          {lname: 'Dixon',fname: 'Adam',job: 'Claims Handler',tel: '01276215005',ext: '35005', image: 'img/users/054.jpg'},
          {lname: 'Douglas',fname: 'Suzy',job: 'Relase Managment Team Leader',tel: '01276215246',ext: '35246', image: 'img/users/055.jpg'},
          {lname: 'Douglas',fname: 'Zoe',job: 'Senior CMS Developer',tel: '01276215290',ext: '35290', image: 'img/users/056.jpg'},
          {lname: 'Doyle',fname: 'Lucas',job: 'Senior SAS Developer',tel: '01276215183',ext: '35183', image: 'img/users/057.jpg'},
          {lname: 'Dumas',fname: 'Nino',job: 'Analysis Manager',tel: '01276215219',ext: '35219', image: 'img/users/058.jpg'},
          {lname: 'Duncan',fname: 'Jeremiah',job: 'Data Analyst',tel: '01276215127',ext: '35127', image: 'img/users/059.jpg'},
          {lname: 'Duncan',fname: 'Lonnie',job: 'Assistant Motor Underwriter',tel: '01276215184',ext: '35184', image: 'img/users/060.jpg'},
          {lname: 'Dunn',fname: 'Amy',job: 'Customer Support Agent',tel: '01276215006',ext: '35006', image: 'img/users/061.jpg'},
          {lname: 'Dunn',fname: 'Diane',job: 'Web Team Leader',tel: '01276215068',ext: '35068', image: 'img/users/062.jpg'},
          {lname: 'Edwards',fname: 'Vernon',job: 'Claims Handler',tel: '01276215279',ext: '35279', image: 'img/users/063.jpg'},
          {lname: 'Elliott',fname: 'Diana',job: 'Claims Handler',tel: '01276215069',ext: '35069', image: 'img/users/064.jpg'},
          {lname: 'Elliott',fname: 'Katherine',job: 'Senior Web Developer',tel: '01276215158',ext: '35158', image: 'img/users/065.jpg'},
          {lname: 'Elliott',fname: 'Lloyd',job: 'Customer Claims Advisor',tel: '01276215185',ext: '35185', image: 'img/users/066.jpg'},
          {lname: 'Evans',fname: 'Bradley',job: 'Claims Manager',tel: '01276215031',ext: '35031', image: 'img/users/067.jpg'},
          {lname: 'Farragher',fname: 'Tomothy',job: 'Java Developer',tel: '01276215264',ext: '35264', image: 'img/users/068.jpg'},
          {lname: 'Fernandez',fname: 'Grace',job: 'Trainee SAS Developer',tel: '01276215107',ext: '35107', image: 'img/users/069.jpg'},
          {lname: 'Fisher',fname: 'Janice',job: 'Assistant Motor Underwriter',tel: '01276215129',ext: '35129', image: 'img/users/070.jpg'},
          {lname: 'Fisher',fname: 'Jeffery',job: 'Junior Java Developer',tel: '01276215128',ext: '35128', image: 'img/users/071.jpg'},
          {lname: 'Fisher',fname: 'Jessica',job: 'Java Developer',tel: '01276215130',ext: '35130', image: 'img/users/072.jpg'},
          {lname: 'Fleming',fname: 'Arnold',job: 'Customer Claims Advisor',tel: '01276215007',ext: '35007', image: 'img/users/073.jpg'},
          {lname: 'Fletcher',fname: 'Randall',job: 'Data Analyst',tel: '01276215230',ext: '35230', image: 'img/users/074.jpg'},
          {lname: 'Ford',fname: 'Byron',job: 'Claims Handler',tel: '01276215032',ext: '35032', image: 'img/users/075.jpg'},
          {lname: 'Ford',fname: 'Christina',job: 'Claims Handler',tel: '01276215049',ext: '35049', image: 'img/users/076.jpg'},
          {lname: 'Fowler',fname: 'Becky',job: 'Customer Claims Advisor',tel: '01276215033',ext: '35033', image: 'img/users/077.jpg'},
          {lname: 'Fowler',fname: 'Joanne',job: 'Home Underwriter',tel: '01276215131',ext: '35131', image: 'img/users/078.jpg'},
          {lname: 'Fowler',fname: 'Randy',job: 'Web Designer',tel: '01276215231',ext: '35231', image: 'img/users/079.jpg'},
          {lname: 'Franklin',fname: 'Isabelle',job: 'Business Analyst',tel: '01276215121',ext: '35121', image: 'img/users/080.jpg'},
          {lname: 'Freeman',fname: 'Aiden',job: 'Junior Java Developer',tel: '01276215008',ext: '35008', image: 'img/users/081.jpg'},
          {lname: 'Freeman',fname: 'Rebecca',job: 'Trainee Web Designer',tel: '01276215232',ext: '35232', image: 'img/users/082.jpg'},
          {lname: 'Fuller',fname: 'Elizabeth',job: 'Business Analyst',tel: '01276215087',ext: '35087', image: 'img/users/083.jpg'},
          {lname: 'Garcia',fname: 'Mike',job: 'Facilities Manager',tel: '01276215201',ext: '35201', image: 'img/users/084.jpg'},
          {lname: 'Garcia',fname: 'Rosie',job: 'Trainee Web Designer',tel: '01276215233',ext: '35233', image: 'img/users/085.jpg'},
          {lname: 'Garza',fname: 'Enrique',job: 'Head of Digital',tel: '01276215088',ext: '35088', image: 'img/users/086.jpg'},
          {lname: 'Gil',fname: 'Mohamed',job: 'Junior SAS Developer',tel: '01276215202',ext: '35202', image: 'img/users/087.jpg'},
          {lname: 'Gonzales',fname: 'Clayton',job: 'Junior SAS Developer',tel: '01276215050',ext: '35050', image: 'img/users/088.jpg'},
          {lname: 'Gonzalez',fname: 'Holly',job: 'CMS Developer',tel: '01276215110',ext: '35110', image: 'img/users/089.jpg'},
          {lname: 'Gonzalez',fname: 'Tracy',job: 'Customer Support Agent',tel: '01276215265',ext: '35265', image: 'img/users/090.jpg'},
          {lname: 'Gosens',fname: 'Kiran',job: 'Project Manager',tel: '01276215159',ext: '35159', image: 'img/users/091.jpg'},
          {lname: 'Graves',fname: 'Louis',job: 'Trainee CMS Developer',tel: '01276215186',ext: '35186', image: 'img/users/092.jpg'},
          {lname: 'Gray',fname: 'Amber',job: 'Regulatory Reporting Accountant',tel: '01276215009',ext: '35009', image: 'img/users/093.jpg'},
          {lname: 'Green',fname: 'William',job: 'Junior Java Developer',tel: '01276215285',ext: '35285', image: 'img/users/094.jpg'},
          {lname: 'Gregory',fname: 'Peter',job: 'Marketing Analyst',tel: '01276215225',ext: '35225', image: 'img/users/095.jpg'},
          {lname: 'Griffin',fname: 'Lucy',job: 'Regulatory Reporting Accountant',tel: '01276215187',ext: '35187', image: 'img/users/096.jpg'},
          {lname: 'Griffin',fname: 'Ray',job: 'Junior Web Designer',tel: '01276215234',ext: '35234', image: 'img/users/097.jpg'},
          {lname: 'Gutierrez',fname: 'Stanley',job: 'Project Manager',tel: '01276215247',ext: '35247', image: 'img/users/098.jpg'},
          {lname: 'Hall',fname: 'Martin',job: 'SAS Developer',tel: '01276215203',ext: '35203', image: 'img/users/099.jpg'},
          {lname: 'Hamilton',fname: 'Barbara',job: 'Business Analyst',tel: '01276215034',ext: '35034', image: 'img/users/100.jpg'},
          {lname: 'Hamilton',fname: 'Nathaniel',job: 'Junior Java Developer',tel: '01276215220',ext: '35220', image: 'img/users/101.jpg'},
          {lname: 'Hanson',fname: 'Donald',job: 'Customer Claims Advisor',tel: '01276215070',ext: '35070', image: 'img/users/102.jpg'},
          {lname: 'Harris',fname: 'Ian',job: 'Customer Claims Advisor',tel: '01276215122',ext: '35122', image: 'img/users/103.jpg'},
          {lname: 'Hart',fname: 'Charlotte',job: 'Home Underwriter',tel: '01276215051',ext: '35051', image: 'img/users/104.jpg'},
          {lname: 'Hart',fname: 'Kimberly',job: 'Assistant Home Underwriter',tel: '01276215160',ext: '35160', image: 'img/users/105.jpg'},
          {lname: 'Hart',fname: 'Mia',job: 'Data Analyst',tel: '01276215205',ext: '35205', image: 'img/users/106.jpg'},
          {lname: 'Hart',fname: 'Micheal',job: 'Web Developer',tel: '01276215204',ext: '35204', image: 'img/users/107.jpg'},
          {lname: 'Harvey',fname: 'Jenny',job: 'Project Manager',tel: '01276215132',ext: '35132', image: 'img/users/108.jpg'},
          {lname: 'Heemstra',fname: 'Sade',job: 'Motor Underwriter',tel: '01276215248',ext: '35248', image: 'img/users/109.jpg'},
          {lname: 'Henry',fname: 'Mathew',job: 'Database Administrator',tel: '01276215206',ext: '35206', image: 'img/users/110.jpg'},
          {lname: 'Hernandez',fname: 'Anna',job: 'Trainee CMS Developer',tel: '01276215010',ext: '35010', image: 'img/users/111.jpg'},
          {lname: 'Hicks',fname: 'Darrell',job: 'Claims Handler',tel: '01276215071',ext: '35071', image: 'img/users/112.jpg'},
          {lname: 'Hill',fname: 'Mia',job: 'Cheif Information Officer',tel: '01276215207',ext: '35207', image: 'img/users/113.jpg'},
          {lname: 'Holmes',fname: 'Ray',job: 'Database Administrator',tel: '01276215236',ext: '35236', image: 'img/users/114.jpg'},
          {lname: 'Holmes',fname: 'Ricardo',job: 'Trainee Web Developer',tel: '01276215235',ext: '35235', image: 'img/users/115.jpg'},
          {lname: 'Hopkins',fname: 'Leon',job: 'Project Manager',tel: '01276215188',ext: '35188', image: 'img/users/116.jpg'},
          {lname: 'Horton',fname: 'Tim',job: 'Junior Web Designer',tel: '01276215266',ext: '35266', image: 'img/users/117.jpg'},
          {lname: 'Howard',fname: 'Matt',job: 'Claims Handler',tel: '01276215208',ext: '35208', image: 'img/users/118.jpg'},
          {lname: 'Howell',fname: 'Kimberly',job: 'Customer Support Agent',tel: '01276215161',ext: '35161', image: 'img/users/119.jpg'},
          {lname: 'Howell',fname: 'Ricky',job: 'Senior SAS Developer',tel: '01276215237',ext: '35237', image: 'img/users/120.jpg'},
          {lname: 'Hudson',fname: 'Kate',job: 'SAS Developer',tel: '01276215162',ext: '35162', image: 'img/users/121.jpg'},
          {lname: 'Hunter',fname: 'Dylan',job: 'Regulatory Reporting Accountant',tel: '01276215072',ext: '35072', image: 'img/users/122.jpg'},
          {lname: 'Hunter',fname: 'Leo',job: 'Junior Web Designer',tel: '01276215189',ext: '35189', image: 'img/users/123.jpg'},
          {lname: 'Hunter',fname: 'Sharon',job: 'Trainee Web Designer',tel: '01276215249',ext: '35249', image: 'img/users/124.jpg'},
          {lname: 'Jackson',fname: 'Andrea',job: 'Data Analyst',tel: '01276215011',ext: '35011', image: 'img/users/125.jpg'},
          {lname: 'Jackson',fname: 'Stanley',job: 'CMS Developer',tel: '01276215250',ext: '35250', image: 'img/users/126.jpg'},
          {lname: 'Jackson',fname: 'Tyrone',job: 'Business Analyst',tel: '01276215267',ext: '35267', image: 'img/users/127.jpg'},
          {lname: 'Jackson',fname: 'Vincent',job: 'Project Manager',tel: '01276215280',ext: '35280', image: 'img/users/128.jpg'},
          {lname: 'Jacobs',fname: 'Donna',job: 'Customer Support Agent',tel: '01276215073',ext: '35073', image: 'img/users/129.jpg'},
          {lname: 'Jacobs',fname: 'Holly',job: 'Junior Web Designer',tel: '01276215111',ext: '35111', image: 'img/users/130.jpg'},
          {lname: 'Jenkins',fname: 'Britney',job: 'Customer Support Agent',tel: '01276215035',ext: '35035', image: 'img/users/131.jpg'},
          {lname: 'Jennings',fname: 'Allie',job: 'Regulatory Reporting Accountant',tel: '01276215012',ext: '35012', image: 'img/users/132.jpg'},
          {lname: 'Jensen',fname: 'Bruce',job: 'Senior Corporate Analyst',tel: '01276215036',ext: '35036', image: 'img/users/133.jpg'},
          {lname: 'Jensen',fname: 'Jorge',job: 'Junior Java Developer',tel: '01276215133',ext: '35133', image: 'img/users/134.jpg'},
          {lname: 'Jensen',fname: 'Leona',job: 'Customer Claims Advisor',tel: '01276215190',ext: '35190', image: 'img/users/135.jpg'},
          {lname: 'Jordan',fname: 'Frederick',job: 'Customer Support Agent',tel: '01276215099',ext: '35099', image: 'img/users/136.jpg'},
          {lname: 'Kalisvaart',fname: 'Shailesh',job: 'Java Developer',tel: '01276215251',ext: '35251', image: 'img/users/137.jpg'},
          {lname: 'Kelley',fname: 'Herbert',job: 'Assistant Home Underwriter',tel: '01276215112',ext: '35112', image: 'img/users/138.jpg'},
          {lname: 'Kelley',fname: 'Wesley',job: 'Senior Web Designer',tel: '01276215286',ext: '35286', image: 'img/users/139.jpg'},
          {lname: 'Kelly',fname: 'Hanna',job: 'Junior Java Developer',tel: '01276215113',ext: '35113', image: 'img/users/140.jpg'},
          {lname: 'Kelly',fname: 'Jesse',job: 'Junior Oracle Developer',tel: '01276215134',ext: '35134', image: 'img/users/141.jpg'},
          {lname: 'Kennedy',fname: 'Donna',job: 'Business Analyst',tel: '01276215074',ext: '35074', image: 'img/users/142.jpg'},
          {lname: 'Kennedy',fname: 'Julia',job: 'Junior CMS Developer',tel: '01276215135',ext: '35135', image: 'img/users/143.jpg'},
          {lname: 'Kennedy',fname: 'Mike',job: 'Claims Manager',tel: '01276215209',ext: '35209', image: 'img/users/144.jpg'},
          {lname: 'Kim',fname: 'Eva',job: 'Home Underwriter',tel: '01276215089',ext: '35089', image: 'img/users/145.jpg'},
          {lname: 'Kim',fname: 'Rick',job: 'Corporate Analyst',tel: '01276215238',ext: '35238', image: 'img/users/146.jpg'},
          {lname: 'Kuhn',fname: 'Flenn',job: 'Facilities Operative',tel: '01276215100',ext: '35100', image: 'img/users/147.jpg'},
          {lname: 'Kuhn',fname: 'Mitchell',job: 'Claims Handler',tel: '01276215210',ext: '35210', image: 'img/users/148.jpg'},
          {lname: 'Lane',fname: 'Maddison',job: 'Head of Claims',tel: '01276215211',ext: '35211', image: 'img/users/149.jpg'},
          {lname: 'Larson',fname: 'Jared',job: 'Home Underwriter',tel: '01276215136',ext: '35136', image: 'img/users/150.jpg'},
          {lname: 'Larson',fname: 'Norman',job: 'Oracle Developer',tel: '01276215221',ext: '35221', image: 'img/users/151.jpg'},
          {lname: 'Lawson',fname: 'Amber',job: 'Corporate Analyst',tel: '01276215013',ext: '35013', image: 'img/users/152.jpg'},
          {lname: 'Lawson',fname: 'Joy',job: 'Customer Support Agent',tel: '01276215137',ext: '35137', image: 'img/users/153.jpg'},
          {lname: 'Little',fname: 'Kevin',job: 'Senior Java Developer',tel: '01276215163',ext: '35163', image: 'img/users/154.jpg'},
          {lname: 'Lord',fname: 'Kayla',job: 'Assistant Home Underwriter',tel: '01276215164',ext: '35164', image: 'img/users/155.jpg'},
          {lname: 'Louman',fname: 'Dorus',job: 'Web Designer',tel: '01276215075',ext: '35075', image: 'img/users/156.jpg'},
          {lname: 'Lowe',fname: 'Carol',job: 'Data Analyst',tel: '01276215052',ext: '35052', image: 'img/users/157.jpg'},
          {lname: 'Lucas',fname: 'Janet',job: 'Project Manager',tel: '01276215138',ext: '35138', image: 'img/users/158.jpg'},
          {lname: 'Lucas',fname: 'Lylou',job: 'Claims Manager',tel: '01276215191',ext: '35191', image: 'img/users/159.jpg'},
          {lname: 'Lucas',fname: 'Marc',job: 'Business Analyst',tel: '01276215212',ext: '35212', image: 'img/users/160.jpg'},
          {lname: 'Lucas',fname: 'Timothy',job: 'Junior CMS Developer',tel: '01276215268',ext: '35268', image: 'img/users/161.jpg'},
          {lname: 'Lynch',fname: 'Lily',job: 'Claims Handler',tel: '01276215192',ext: '35192', image: 'img/users/162.jpg'},
          {lname: 'Lynch',fname: 'Teresa',job: 'Business Analyst',tel: '01276215269',ext: '35269', image: 'img/users/163.jpg'},
          {lname: 'Macrae',fname: 'Tristan',job: 'Facilities Manager',tel: '01276215270',ext: '35270', image: 'img/users/164.jpg'},
          {lname: 'Marie',fname: 'Jordan',job: 'Senior SAS Developer',tel: '01276215139',ext: '35139', image: 'img/users/165.jpg'},
          {lname: 'Martin',fname: 'Eli',job: 'Data Analyst',tel: '01276215090',ext: '35090', image: 'img/users/166.jpg'},
          {lname: 'Martinez',fname: 'Jakob',job: 'Senior Corporate Analyst',tel: '01276215140',ext: '35140', image: 'img/users/167.jpg'},
          {lname: 'May',fname: 'Sammy',job: 'Senior Database Administrator',tel: '01276215252',ext: '35252', image: 'img/users/168.jpg'},
          {lname: 'Mccoy',fname: 'Ava',job: 'Project Manager',tel: '01276215014',ext: '35014', image: 'img/users/169.jpg'},
          {lname: 'Mccoy',fname: 'Isabelle',job: 'Senior CMS Developer',tel: '01276215123',ext: '35123', image: 'img/users/170.jpg'},
          {lname: 'Mccoy',fname: 'Karl',job: 'Claims Handler',tel: '01276215165',ext: '35165', image: 'img/users/171.jpg'},
          {lname: 'Mccoy',fname: 'Marie',job: 'Web Developer',tel: '01276215213',ext: '35213', image: 'img/users/172.jpg'},
          {lname: 'Mcdonalid',fname: 'Vernon',job: 'Trainee SAS Developer',tel: '01276215281',ext: '35281', image: 'img/users/173.jpg'},
          {lname: 'Mckinney',fname: 'Jeremiah',job: 'Senior Java Developer',tel: '01276215141',ext: '35141', image: 'img/users/174.jpg'},
          {lname: 'Menard',fname: 'Elouan',job: 'Claims Manager',tel: '01276215091',ext: '35091', image: 'img/users/175.jpg'},
          {lname: 'Mendoza',fname: 'Karen',job: 'Senior Web Developer',tel: '01276215166',ext: '35166', image: 'img/users/176.jpg'},
          {lname: 'Meyer',fname: 'Kelly',job: 'Customer Support Agent',tel: '01276215167',ext: '35167', image: 'img/users/177.jpg'},
          {lname: 'Meyer',fname: 'Samuel',job: 'Trainee CMS Developer',tel: '01276215253',ext: '35253', image: 'img/users/178.jpg'},
          {lname: 'Miles',fname: 'Alan',job: 'Trainee Database Administrator',tel: '01276215015',ext: '35015', image: 'img/users/179.jpg'},
          {lname: 'Miles',fname: 'Florence',job: 'Senior Java Developer',tel: '01276215101',ext: '35101', image: 'img/users/180.jpg'},
          {lname: 'Miles',fname: 'Savannah',job: 'Junior Java Developer',tel: '01276215254',ext: '35254', image: 'img/users/181.jpg'},
          {lname: 'Miller',fname: 'Julie',job: 'Customer Claims Advisor',tel: '01276215142',ext: '35142', image: 'img/users/182.jpg'},
          {lname: 'Mills',fname: 'Sofia',job: 'Junior SAS Developer',tel: '01276215255',ext: '35255', image: 'img/users/183.jpg'},
          {lname: 'Mitchelle',fname: 'Avery',job: 'Junior Oracle Developer',tel: '01276215016',ext: '35016', image: 'img/users/184.jpg'},
          {lname: 'Mitchelle',fname: 'Jenny',job: 'Claims Handler',tel: '01276215143',ext: '35143', image: 'img/users/185.jpg'},
          {lname: 'Montgomery',fname: 'Carolyn',job: 'Web Designer',tel: '01276215053',ext: '35053', image: 'img/users/186.jpg'},
          {lname: 'Moore',fname: 'Kelly',job: 'Claims Manager',tel: '01276215168',ext: '35168', image: 'img/users/187.jpg'},
          {lname: 'Morales',fname: 'Frederick',job: 'Marketing Analyst',tel: '01276215102',ext: '35102', image: 'img/users/188.jpg'},
          {lname: 'Moreno',fname: 'Harvey',job: 'Analysis Manager',tel: '01276215114',ext: '35114', image: 'img/users/189.jpg'},
          {lname: 'Morgan',fname: 'Abigail',job: 'Java Developer',tel: '01276215017',ext: '35017', image: 'img/users/190.jpg'},
          {lname: 'Morrison',fname: 'Clyde',job: 'Web Support Team Leader',tel: '01276215054',ext: '35054', image: 'img/users/191.jpg'},
          {lname: 'Murphy',fname: 'Danny',job: 'Customer Claims Advisor',tel: '01276215076',ext: '35076', image: 'img/users/192.jpg'},
          {lname: 'Myers',fname: 'Andrew',job: 'SAS Developer',tel: '01276215018',ext: '35018', image: 'img/users/193.jpg'},
          {lname: 'Myers',fname: 'Cecil',job: 'Customer Support Agent',tel: '01276215055',ext: '35055', image: 'img/users/194.jpg'},
          {lname: 'Myers',fname: 'Karen',job: 'Claims Manager',tel: '01276215169',ext: '35169', image: 'img/users/195.jpg'},
          {lname: 'Nelson',fname: 'Jimmy',job: 'Junior Corporate Analyst',tel: '01276215144',ext: '35144', image: 'img/users/196.jpg'},
          {lname: 'Newman',fname: 'Kurt',job: 'SAS Developer',tel: '01276215170',ext: '35170', image: 'img/users/197.jpg'},
          {lname: 'Nguyen',fname: 'Tommy',job: 'Claims Manager',tel: '01276215271',ext: '35271', image: 'img/users/198.jpg'},
          {lname: 'Obrien',fname: 'Brad',job: 'Oracle Developer',tel: '01276215037',ext: '35037', image: 'img/users/199.jpg'},
          {lname: 'Owens',fname: 'Jakob',job: 'Head of Finance',tel: '01276215145',ext: '35145', image: 'img/users/200.jpg'},
          {lname: 'Parker',fname: 'Julia',job: 'Project Manager',tel: '01276215146',ext: '35146', image: 'img/users/201.jpg'},
          {lname: 'Payne',fname: 'Constance',job: 'Marketing Analyst',tel: '01276215056',ext: '35056', image: 'img/users/202.jpg'},
          {lname: 'Pearson',fname: 'Antonio',job: 'Java Developer',tel: '01276215019',ext: '35019', image: 'img/users/203.jpg'},
          {lname: 'Pearson',fname: 'Kurt',job: 'Junior Corporate Analyst',tel: '01276215171',ext: '35171', image: 'img/users/204.jpg'},
          {lname: 'Peck',fname: 'Donald',job: 'Internal Communication Manager',tel: '01276215077',ext: '35077', image: 'img/users/205.jpg'},
          {lname: 'Pel',fname: 'Heinrich',job: 'Web Support Team Leader',tel: '01276215115',ext: '35115', image: 'img/users/206.jpg'},
          {lname: 'Perkins',fname: 'Jordan',job: 'Assistant Motor Underwriter',tel: '01276215147',ext: '35147', image: 'img/users/207.jpg'},
          {lname: 'Perry',fname: 'Byron',job: 'Claims Handler',tel: '01276215038',ext: '35038', image: 'img/users/208.jpg'},
          {lname: 'Peters',fname: 'Herbert',job: 'Marketing Analyst',tel: '01276215116',ext: '35116', image: 'img/users/209.jpg'},
          {lname: 'Porter',fname: 'Bradley',job: 'Trainee Oracle Developer',tel: '01276215039',ext: '35039', image: 'img/users/210.jpg'},
          {lname: 'Porter',fname: 'Michelle',job: 'Project Manager',tel: '01276215214',ext: '35214', image: 'img/users/211.jpg'},
          {lname: 'Porter',fname: 'Virgil',job: 'Claims Handler',tel: '01276215282',ext: '35282', image: 'img/users/212.jpg'},
          {lname: 'Powell',fname: 'Sophie',job: 'Junior Java Developer',tel: '01276215256',ext: '35256', image: 'img/users/213.jpg'},
          {lname: 'Price',fname: 'Caroline',job: 'Senior Web Designer',tel: '01276215057',ext: '35057', image: 'img/users/214.jpg'},
          {lname: 'Price',fname: 'Eva',job: 'Senior CMS Developer',tel: '01276215092',ext: '35092', image: 'img/users/215.jpg'},
          {lname: 'Prieto',fname: 'Blanca',job: 'Business Analyst',tel: '01276215040',ext: '35040', image: 'img/users/216.jpg'},
          {lname: 'Ramirez',fname: 'Ashley',job: 'Customer Support Agent',tel: '01276215020',ext: '35020', image: 'img/users/217.jpg'},
          {lname: 'Ramirez',fname: 'Lily',job: 'Customer Support Agent',tel: '01276215193',ext: '35193', image: 'img/users/218.jpg'},
          {lname: 'Ramirez',fname: 'Walter',job: 'Junior CMS Developer',tel: '01276215287',ext: '35287', image: 'img/users/219.jpg'},
          {lname: 'Ray',fname: 'Amanda',job: 'Senior Oracle Developer',tel: '01276215021',ext: '35021', image: 'img/users/220.jpg'},
          {lname: 'Ray',fname: 'Diane',job: 'Junior SAS Developer',tel: '01276215078',ext: '35078', image: 'img/users/221.jpg'},
          {lname: 'Reyes',fname: 'Darryl',job: 'Senior SAS Developer',tel: '01276215079',ext: '35079', image: 'img/users/222.jpg'},
          {lname: 'Reyes',fname: 'Julia',job: 'Customer Claims Advisor',tel: '01276215148',ext: '35148', image: 'img/users/223.jpg'},
          {lname: 'Reynolds',fname: 'Oscar',job: 'Assistant Motor Underwriter',tel: '01276215224',ext: '35224', image: 'img/users/224.jpg'},
          {lname: 'Rhodes',fname: 'Avery',job: 'Trainee Oracle Developer',tel: '01276215022',ext: '35022', image: 'img/users/225.jpg'},
          {lname: 'Rice',fname: 'Ralph',job: 'Trainee Java Developer',tel: '01276215239',ext: '35239', image: 'img/users/226.jpg'},
          {lname: 'Richards',fname: 'Gregory',job: 'Regulatory Reporting Accountant',tel: '01276215108',ext: '35108', image: 'img/users/227.jpg'},
          {lname: 'Riley',fname: 'Mary',job: 'Customer Support Agent',tel: '01276215215',ext: '35215', image: 'img/users/228.jpg'},
          {lname: 'Ringelberg',fname: 'Toke',job: 'Claims Handler',tel: '01276215272',ext: '35272', image: 'img/users/229.jpg'},
          {lname: 'Rivera',fname: 'Ellie',job: 'Junior SAS Developer',tel: '01276215093',ext: '35093', image: 'img/users/230.jpg'},
          {lname: 'Robertson',fname: 'Katie',job: 'Assistant Motor Underwriter',tel: '01276215172',ext: '35172', image: 'img/users/231.jpg'},
          {lname: 'Rodriguez',fname: 'Leah',job: 'Business Analyst',tel: '01276215194',ext: '35194', image: 'img/users/232.jpg'},
          {lname: 'Rodriquez',fname: 'Phoebe',job: 'Business Analyst',tel: '01276215226',ext: '35226', image: 'img/users/233.jpg'},
          {lname: 'Rose',fname: 'Brandie',job: 'Web Team Leader',tel: '01276215041',ext: '35041', image: 'img/users/234.jpg'},
          {lname: 'Ross',fname: 'Kimberly',job: 'Head of Digital',tel: '01276215173',ext: '35173', image: 'img/users/235.jpg'},
          {lname: 'Russell',fname: 'Melvin',job: 'Corporate Analyst',tel: '01276215216',ext: '35216', image: 'img/users/236.jpg'},
          {lname: 'Ryan',fname: 'Todd',job: 'Customer Support Agent',tel: '01276215273',ext: '35273', image: 'img/users/237.jpg'},
          {lname: 'Sanchez',fname: 'Kristin',job: 'SAS Developer',tel: '01276215174',ext: '35174', image: 'img/users/238.jpg'},
          {lname: 'Sanders',fname: 'Chris',job: 'Junior Database Administrator',tel: '01276215058',ext: '35058', image: 'img/users/239.jpg'},
          {lname: 'Sanders',fname: 'Jesus',job: 'Junior Web Developer',tel: '01276215149',ext: '35149', image: 'img/users/240.jpg'},
          {lname: 'Schenkels',fname: 'Cherelle',job: 'Senior Oracle Developer',tel: '01276215059',ext: '35059', image: 'img/users/241.jpg'},
          {lname: 'Scott',fname: 'Dwight',job: 'CMS Developer',tel: '01276215080',ext: '35080', image: 'img/users/242.jpg'},
          {lname: 'Scott',fname: 'Eliza',job: 'Trainee Java Developer',tel: '01276215094',ext: '35094', image: 'img/users/243.jpg'},
          {lname: 'Scott',fname: 'Harold',job: 'Project Manager',tel: '01276215117',ext: '35117', image: 'img/users/244.jpg'},
          {lname: 'Scott',fname: 'Kaitlin',job: 'Internal Communication Manager',tel: '01276215175',ext: '35175', image: 'img/users/245.jpg'},
          {lname: 'Setz',fname: 'Reineke',job: 'Claims Handler',tel: '01276215240',ext: '35240', image: 'img/users/246.jpg'},
          {lname: 'Shelton',fname: 'Hunter',job: 'Motor Underwriter',tel: '01276215118',ext: '35118', image: 'img/users/247.jpg'},
          {lname: 'Silva',fname: 'George',job: 'Customer Claims Advisor',tel: '01276215109',ext: '35109', image: 'img/users/248.jpg'},
          {lname: 'Simmons',fname: 'Todd',job: 'Senior Java Developer',tel: '01276215274',ext: '35274', image: 'img/users/249.jpg'},
          {lname: 'Smith',fname: 'Arthur',job: 'Web Designer',tel: '01276215023',ext: '35023', image: 'img/users/250.jpg'},
          {lname: 'Smith',fname: 'Joshua',job: 'Project Manager',tel: '01276215150',ext: '35150', image: 'img/users/251.jpg'},
          {lname: 'Stalman',fname: 'Wolf',job: 'Senior Corporate Analyst',tel: '01276215288',ext: '35288', image: 'img/users/252.jpg'},
          {lname: 'Stevens',fname: 'Timothy',job: 'Claims Handler',tel: '01276215275',ext: '35275', image: 'img/users/253.jpg'},
          {lname: 'Stewart',fname: 'Tyler',job: 'Senior SAS Developer',tel: '01276215276',ext: '35276', image: 'img/users/254.jpg'},
          {lname: 'Sutton',fname: 'Ross',job: 'Senior Oracle Developer',tel: '01276215241',ext: '35241', image: 'img/users/255.jpg'},
          {lname: 'Termeer',fname: 'Faissal',job: 'Senior Web Designer',tel: '01276215103',ext: '35103', image: 'img/users/256.jpg'},
          {lname: 'Torres',fname: 'Enrique',job: 'Project Manager',tel: '01276215095',ext: '35095', image: 'img/users/257.jpg'},
          {lname: 'Turner',fname: 'Callum',job: 'Relase Managment Team Leader',tel: '01276215060',ext: '35060', image: 'img/users/258.jpg'},
          {lname: 'Van alem',fname: 'Faris',job: 'Assistant Home Underwriter',tel: '01276215104',ext: '35104', image: 'img/users/259.jpg'},
          {lname: 'van den bulk',fname: 'cyrille', job: 'Customer Support Agent',tel: '01276215061',ext: '35061', image: 'img/users/260.jpg'},
          {lname: 'Vargas',fname: 'Carolyn',job: 'Senior Database Administrator',tel: '01276215062',ext: '35062', image: 'img/users/261.jpg'},
          {lname: 'Vasquez',fname: 'Enrique',job: 'SAS Developer',tel: '01276215096',ext: '35096', image: 'img/users/262.jpg'},
          {lname: 'Vasquez',fname: 'Seth',job: 'Customer Claims Advisor',tel: '01276215257',ext: '35257', image: 'img/users/263.jpg'},
          {lname: 'Verdult',fname: 'Luciano',job: 'Trainee Web Developer',tel: '01276215195',ext: '35195', image: 'img/users/264.jpg'},
          {lname: 'Vidal',fname: 'Lilou',job: 'Assistant Motor Underwriter',tel: '01276215196',ext: '35196', image: 'img/users/265.jpg'},
          {lname: 'Wade',fname: 'Eleanor',job: 'Junior Oracle Developer',tel: '01276215097',ext: '35097', image: 'img/users/266.jpg'},
          {lname: 'Walker',fname: 'Charlotte',job: 'Motor Underwriter',tel: '01276215063',ext: '35063', image: 'img/users/267.jpg'},
          {lname: 'Walker',fname: 'Shawn',job: 'Senior Java Developer',tel: '01276215258',ext: '35258', image: 'img/users/268.jpg'},
          {lname: 'Wallace',fname: 'Rafael',job: 'Claims Handler',tel: '01276215242',ext: '35242', image: 'img/users/269.jpg'},
          {lname: 'Wallace',fname: 'Willie',job: 'Java Developer',tel: '01276215289',ext: '35289', image: 'img/users/270.jpg'},
          {lname: 'Walters',fname: 'Clifton',job: 'Head of Claims',tel: '01276215064',ext: '35064', image: 'img/users/271.jpg'},
          {lname: 'Warren',fname: 'Jon',job: 'Trainee SAS Developer',tel: '01276215151',ext: '35151', image: 'img/users/272.jpg'},
          {lname: 'Washington',fname: 'Nick',job: 'Senior Java Developer',tel: '01276215222',ext: '35222', image: 'img/users/273.jpg'},
          {lname: 'Watson',fname: 'Britney',job: 'Cheif Information Officer',tel: '01276215042',ext: '35042', image: 'img/users/274.jpg'},
          {lname: 'Watson',fname: 'Harvey',job: 'Oracle Developer',tel: '01276215119',ext: '35119', image: 'img/users/275.jpg'},
          {lname: 'Watts',fname: 'Beverly',job: 'Senior Oracle Developer',tel: '01276215043',ext: '35043', image: 'img/users/276.jpg'},
          {lname: 'Watts',fname: 'Jorge',job: 'Senior SAS Developer',tel: '01276215152',ext: '35152', image: 'img/users/277.jpg'},
          {lname: 'Webb',fname: 'Mitchell',job: 'Assistant Motor Underwriter',tel: '01276215217',ext: '35217', image: 'img/users/278.jpg'},
          {lname: 'Welch',fname: 'Justin',job: 'Home Underwriter',tel: '01276215153',ext: '35153', image: 'img/users/279.jpg'},
          {lname: 'Welch',fname: 'Ted',job: 'Customer Claims Advisor',tel: '01276215277',ext: '35277', image: 'img/users/280.jpg'},
          {lname: 'Wells',fname: 'Jason',job: 'Senior Corporate Analyst',tel: '01276215154',ext: '35154', image: 'img/users/281.jpg'},
          {lname: 'West',fname: 'Kevin',job: 'Regulatory Reporting Accountant',tel: '01276215176',ext: '35176', image: 'img/users/282.jpg'},
          {lname: 'West',fname: 'Sergio',job: 'Facilities Operative',tel: '01276215259',ext: '35259', image: 'img/users/283.jpg'},
          {lname: 'Wheeler',fname: 'Alison',job: 'Senior Java Developer',tel: '01276215024',ext: '35024', image: 'img/users/284.jpg'},
          {lname: 'Wheeler',fname: 'Harvey',job: 'Junior Web Developer',tel: '01276215120',ext: '35120', image: 'img/users/285.jpg'},
          {lname: 'Wheeler',fname: 'Jim',job: 'Customer Claims Advisor',tel: '01276215155',ext: '35155', image: 'img/users/286.jpg'},
          {lname: 'Wheeler',fname: 'Laura',job: 'SAS Developer',tel: '01276215197',ext: '35197', image: 'img/users/287.jpg'},
          {lname: 'White',fname: 'Karen',job: 'Junior Database Administrator',tel: '01276215177',ext: '35177', image: 'img/users/288.jpg'},
          {lname: 'Willis',fname: 'Chloe',job: 'Data Analyst',tel: '01276215065',ext: '35065', image: 'img/users/289.jpg'},
          {lname: 'Wilson',fname: 'Jerome',job: 'Trainee SAS Developer',tel: '01276215156',ext: '35156', image: 'img/users/290.jpg'},
        ];

        var factory = {};

        factory.getPeople = function() {
            
            var deferred = $q.defer();

            deferred.resolve(people);
            
            //deferred.reject();

            return deferred.promise;
        };

        return factory;
    }])

})(window.angular);